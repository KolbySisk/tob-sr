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
import * as agility from './agility';
import * as fireMaking from './fire-making';
import * as runeCrafting from './rune-crafting';

import 'dotenv/config';

export const state = new State({ paused: false });

const scripts: {
  Banking: typeof banking;
  Mining: typeof mining;
  Agility: typeof agility;
  FireMaking: typeof fireMaking;
  RuneCrafting: typeof runeCrafting;
} = {
  Banking: banking,
  Mining: mining,
  Agility: agility,
  FireMaking: fireMaking,
  RuneCrafting: runeCrafting,
};

const init = async () => {
  // Get the active screen and save the region. This is useful for calculations, like finding the inventory.
  console.log('Select window');
  await sleep(1000);
  const activeWindow = await getActiveWindow();
  const activeWindowRegion = await activeWindow.region;
  state.activeWindowRegion = activeWindowRegion;
  screen.highlight(activeWindowRegion);
  console.log(`Active window region saved as: ${activeWindowRegion}`);

  // Calculate the inventory size and position based on the window region
  const inventoryWidth = activeWindowRegion.width * 0.2135;
  const inventoryHeight = activeWindowRegion.height * 0.52;
  const inventoryLeft =
    activeWindowRegion.width - inventoryWidth - activeWindowRegion.width * 0.0625;
  const inventoryTop =
    activeWindowRegion.height - inventoryHeight - activeWindowRegion.height * 0.0648;
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

  // Calculate the minimap size and location
  const minimapWidthAndHeight = activeWindowRegion.width * 0.17;
  const minimapLeft =
    activeWindowRegion.width - minimapWidthAndHeight - activeWindowRegion.width * 0.0215;
  const minimapTop = activeWindowRegion.height * 0.015;
  const minimapRegion = new Region(
    minimapLeft,
    minimapTop,
    minimapWidthAndHeight,
    minimapWidthAndHeight
  );
  state.minimapRegion = minimapRegion;
  screen.highlight(minimapRegion);

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
  //await initSlack();
  init();
})();
