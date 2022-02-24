'use strict';

import _ from 'lodash';
import {
  clickPoint,
  colorCheck,
  getFuzzyNumber,
  pause,
  pressKey,
  randomSleep,
  runSetup,
  sleep,
} from './utils';
import { Actions, Milliseconds } from './types';
import iohook from 'iohook';

export let paused = false;

const iterationsToRun = 10000;
let iterationCount = 0;

const actionWaitTime: Milliseconds = 15000;

const doActions = async (actions: Actions) => {
  await randomSleep();

  for (const action of actions) {
    if (paused) await pause();

    // Perform action - click
    if (action.actionType === 'click') {
      // Check color of click position is the expected color
      await colorCheck(action.data.point, action.data.color);

      // Move mouse to a fuzzy position and click
      await clickPoint({ point: action.data.point, fuzzy: true });

      // randomize the delay after each click - random ms between 500 - 1500
      await sleep(getFuzzyNumber(1000, 500));
    }

    // Perform action - type
    else if (action.actionType === 'keypress') {
      if (action.data === 32) await sleep(actionWaitTime);
      else pressKey(action.data);
    }
  }

  iterationCount++;
};

const runBot = async (actions: Actions) => {
  paused = false;

  while (iterationCount < iterationsToRun) {
    await doActions(actions);
    await sleep(200);
  }
};

export const initControls = () => {
  iohook.on('keypress', (key: { rawcode: number }) => {
    // Exit when backtick is pressed
    if (key.rawcode === 192) process.exit(1);
    // Pause/Resume when p is pressed
    else if (key.rawcode === 80) paused = !paused;
  });
};

const init = async () => {
  initControls();
  const actions = await runSetup();
  console.log(JSON.stringify(actions));
  runBot(actions);
};

init();

/**
 * Ideas:
 * - GUI
 * - Save actions, run last actions
 */
