'use strict';

import robot from 'robotjs';
import _ from 'lodash';
import {
  getColorAtPosition,
  getColorSimilarity,
  getFuzzyNumber,
  pressKey,
  randomSleep,
  runSetup,
  sleep,
} from './utils';
import { Actions, Milliseconds, Position } from './types';

let actions: Actions;

const maxIterations = 10000;

const actionWaitTime: Milliseconds = 33000;

const tick = async () => {
  for (const action of actions) {
    if (action.actionType === 'click') {
      const fuzzyPosition: Position = {
        x: getFuzzyNumber(action.data.position.x, 3),
        y: getFuzzyNumber(action.data.position.y, 3),
      };
      robot.moveMouseSmooth(fuzzyPosition.x, fuzzyPosition.y, 1);

      const colorAtFuzzyPosition = getColorAtPosition(action.data.position);
      const colorSimilarity = getColorSimilarity(colorAtFuzzyPosition, action.data.color);
      console.log(colorSimilarity);
      if (colorSimilarity > 20) throw new Error('Colors not similar enough');

      robot.mouseClick();
    } else if (action.actionType === 'keypress') {
      if (action.data === 32) await sleep(actionWaitTime);
      else pressKey(action.data);
    }
  }
};

const runBot = async () => {
  robot.setMouseDelay(1000);
  robot.setKeyboardDelay(1000);
  for (let index = 1; index < maxIterations; index++) {
    await tick();
    await randomSleep();
  }
};

const init = async () => {
  actions = await runSetup();
  console.log(JSON.stringify(actions));
  runBot();
};

init();
