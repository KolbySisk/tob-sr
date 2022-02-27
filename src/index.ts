'use strict';

import inquirer from 'inquirer';
import * as banking from './banking';
import * as mining from './mining';
import { State } from './state';
import { initControls } from './utils';

export const state = new State({ paused: false });

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
