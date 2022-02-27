'use strict';

import iohook from 'iohook';
import { sleep } from '@nut-tree/nut-js';
import inquirer from 'inquirer';
import * as banking from './banking';
import * as mining from './mining';

export let paused = false;

export const pause = async () => {
  await sleep(1000);
  if (paused) await pause();
};

const initControls = () => {
  iohook.on('keypress', (key: { rawcode: number }) => {
    // Exit when backtick is pressed
    if (key.rawcode === 192) {
      process.exit();
    }

    // Pause/Resume when p is pressed
    else if (key.rawcode === 80) {
      console.log(paused ? 'resuming' : 'pausing');
      paused = !paused;
    }
  });
};

const scripts: {
  Banking: typeof banking;
  Mining: typeof mining;
} = {
  Banking: banking,
  Mining: mining,
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

init();
