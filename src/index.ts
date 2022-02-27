'use strict';

import inquirer from 'inquirer';
import { State } from './state';
import { getNumberFromRegion, getRegion, initControls } from './utils';
import * as banking from './banking';
import * as mining from './mining';
import * as thievingKnight from './thieving-knight';

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

init();
