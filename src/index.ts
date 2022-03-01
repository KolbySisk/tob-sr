'use strict';

import { createEventAdapter } from '@slack/events-api';
import localtunnel from 'localtunnel';
import inquirer from 'inquirer';
import { State } from './state';
import { getNumberFromRegion, getRegion, initControls } from './utils';
import * as banking from './banking';
import * as mining from './mining';
import * as thievingKnight from './thieving-knight';

import 'dotenv/config';

export const state = new State({ paused: false });

const scripts: {
  Banking: typeof banking;
  Mining: typeof mining;
  ThievingKnight: typeof thievingKnight;
} = {
  Banking: banking,
  Mining: mining,
  ThievingKnight: thievingKnight,
};

const init = async () => {
  initControls();

  // while (true) {
  //   const healthRegion = await getRegion();
  //   const health = await getNumberFromRegion(healthRegion);
  //   console.log(health);
  // }

  const { script } = await inquirer.prompt([
    {
      type: 'list',
      name: 'script',
      message: 'Select a training method',
      choices: Object.keys(scripts),
    },
  ]);

  scripts[script as keyof typeof scripts].init();
};

const initSlack = async () => {
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
  if (!slackSigningSecret) {
    throw new Error('Add SLACK_SIGNING_SECRET to .env file');
  }

  // Start a tunnel using https://github.com/localtunnel/localtunnel
  await localtunnel({ port, subdomain: 'tob-sr' });

  const slackEvents = createEventAdapter(slackSigningSecret);

  slackEvents.on('message', (event: { text: string }) => {
    if (event.text === 'quit') {
      process.exit();
    } else if (event.text === 'pause') {
      state.setPaused(!state.paused);
    }
  });

  // Start the built-in server
  const server = await slackEvents.start(port);

  // Log a message when the server is ready
  console.log(`Listening for events on ${server?.address()}`);
};

(async () => {
  await initSlack();
  init();
})();
