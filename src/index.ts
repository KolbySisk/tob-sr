'use strict';

import { getActiveWindow, Region, screen, sleep } from '@nut-tree/nut-js';
import { createEventAdapter } from '@slack/events-api';
import { blue } from 'colorette';
import localtunnel from 'localtunnel';
import inquirer from 'inquirer';
import { State } from './state';
import { initControls } from './utils';
import * as banking from './banking';
import * as mining from './mining';
import * as fireMaking from './fire-making';

import 'dotenv/config';

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

  // Get the active screen and save the region. This is useful for calculations, like finding the inventory.
  console.log('Select window');
  await sleep(1000);
  const activeWindow = await getActiveWindow();
  const activeWindowRegion = await activeWindow.region;
  state.activeWindowRegion = activeWindowRegion;
  screen.highlight(activeWindowRegion);
  console.log(`Active window region saved as: ${activeWindowRegion}`);

  // Calculate the inventory size and position based on the window region
  const inventoryWidth = activeWindowRegion.width * 0.21;
  const inventoryHeight = activeWindowRegion.height * 0.5;
  const inventoryLeft =
    activeWindowRegion.left +
    activeWindowRegion.width -
    inventoryWidth -
    activeWindowRegion.width * 0.085;
  const inventoryTop =
    activeWindowRegion.top +
    activeWindowRegion.height -
    inventoryHeight -
    activeWindowRegion.height * 0.06;
  const inventoryRegion = new Region(inventoryLeft, inventoryTop, inventoryWidth, inventoryHeight);
  state.inventoryRegion = inventoryRegion;
  screen.highlight(inventoryRegion);

  // Calculate individual inventory item regions
  const inventoryItemRegions: Region[] = [];
  const inventoryItemWidth = inventoryWidth / 4;
  const inventoryItemHeight = inventoryHeight / 7;

  for (let x = 0; x < 4; x++) {
    for (let y = 0; y < 7; y++) {
      const left = inventoryLeft + x * inventoryItemWidth;
      const top = inventoryTop + y * inventoryItemHeight;

      const inventoryItemRegion = new Region(left, top, inventoryItemWidth, inventoryItemHeight);
      inventoryItemRegions.push(inventoryItemRegion);
    }
  }

  state.inventoryItemRegions = inventoryItemRegions;

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
      state.paused = !state.paused;
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
