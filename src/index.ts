'use strict';

import { createEventAdapter } from '@slack/events-api';
import localtunnel from 'localtunnel';
import inquirer from 'inquirer';
import { State } from './state';
import { initControls } from './utils';
import * as banking from './banking';
import * as mining from './mining';
import * as fireMaking from './fire-making';

import 'dotenv/config';
import { blue } from 'colorette';

export const state = new State({ paused: false });

const scripts: {
  Banking: typeof banking;
  Mining: typeof mining;
  FireMaking: typeof fireMaking;
} = {
  Banking: banking,
  Mining: mining,
  FireMaking: fireMaking,
};

const init = async () => {
  initControls();

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
  const tunnel = await localtunnel({ port, subdomain: process.env.TUNNEL_SUBDOMAIN });

  tunnel.on('error', (error) => {
    console.log(error);
  });

  const slackEvents = createEventAdapter(slackSigningSecret);

  slackEvents.on('message', (event: { text: string }) => {
    if (event.text.toLowerCase() === 'quit') {
      process.exit();
    } else if (event.text.toLowerCase() === 'pause') {
      state.setPaused(!state.paused);
    }
  });

  // Start the built-in server
  await slackEvents.start(port);

  // Log a message when the server is ready
  console.log(blue(`Server started at localhost:${port}`));
  console.log(blue(`Listening for events at ${tunnel.url}`));
};

(async () => {
  await initSlack();
  init();
})();
