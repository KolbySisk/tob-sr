'use strict';

import robot from 'robotjs';
import _ from 'lodash';
import { getFuzzyNumber, randomSleep, runSetup } from './utils';
import { Position } from './types';

let positions: Position[];

const maxIterations = 1045;

const tick = () => {
  positions.forEach((position) => {
    robot.moveMouseSmooth(getFuzzyNumber(position.x, 5), getFuzzyNumber(position.y, 5));
    robot.mouseClick();
  });
};

const runBot = async () => {
  for (let index = 1; index < maxIterations; index++) {
    tick();
    await randomSleep();
  }
};

const init = async () => {
  positions = await runSetup();
  runBot();
};

init();
