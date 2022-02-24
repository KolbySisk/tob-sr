'use strict';

import robot from 'robotjs';
import _ from 'lodash';
import { colorCheck, getFuzzyNumber, pressKey, randomSleep, runSetup, sleep } from './utils';
import { Actions, Milliseconds, Position } from './types';

let actions: Actions;

const maxIterations = 10000;

const actionWaitTime: Milliseconds = 15000;

const tick = async () => {
  for (const action of actions) {
    if (action.actionType === 'click') {
      // Check color of click position is the expected color
      await colorCheck(action.data.position, action.data.color);

      // Move mouse to a fuzzy position
      const fuzzyPosition: Position = {
        x: getFuzzyNumber(action.data.position.x, 10),
        y: getFuzzyNumber(action.data.position.y, 10),
      };
      robot.moveMouseSmooth(fuzzyPosition.x, fuzzyPosition.y, 1);

      // randomize the delay after each click - random ms between 500 - 1500
      robot.setMouseDelay(getFuzzyNumber(1000, 500));

      robot.mouseClick();
    } else if (action.actionType === 'keypress') {
      if (action.data === 32) await sleep(actionWaitTime);
      else pressKey(action.data);
    }
  }
};

const runBot = async () => {
  // while(true) console.log(robot.getMousePos())

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
