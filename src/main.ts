'use strict';

import _ from 'lodash';
import {
  clickPoint,
  colorCheck,
  getFuzzyNumber,
  pressKey,
  randomSleep,
  runSetup,
  sleep,
} from './utils';
import { Actions, Milliseconds } from './types';

let actions: Actions;

const maxIterations = 10000;

const actionWaitTime: Milliseconds = 15000;

const doActions = async () => {
  for (const action of actions) {
    if (action.actionType === 'click') {
      // Check color of click position is the expected color
      await colorCheck(action.data.point, action.data.color);

      // Move mouse to a fuzzy position and click
      await clickPoint({ point: action.data.point, fuzzy: true });

      // randomize the delay after each click - random ms between 500 - 1500
      await sleep(getFuzzyNumber(1000, 500));
    } else if (action.actionType === 'keypress') {
      if (action.data === 32) await sleep(actionWaitTime);
      else pressKey(action.data);
    }
  }
};

const runBot = async () => {
  for (let index = 1; index < maxIterations; index++) {
    await doActions();
    await randomSleep();
  }
};

const init = async () => {
  actions = await runSetup();
  console.log(JSON.stringify(actions));
  runBot();
};

init();

/**
 * Ideas:
 * - GUI
 * - Pause / Resume
 * - Save actions, run last actions
 */
