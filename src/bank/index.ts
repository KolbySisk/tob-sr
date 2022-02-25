'use strict';

import _ from 'lodash';
import iohook from 'iohook';
import { clickPoint, colorCheck, getFuzzyNumber, pressKey, randomSleep, sleep } from '../utils';
import { Actions, TrainingMethod } from '../types';
import { getTrainingMethod, runSetup } from './utils';

export let paused = false;
export let trainingMethod: TrainingMethod;

const iterationsToRun = 10000; // TODO: move to console
let iterationCount = 0;

const pause = async () => {
  await sleep(1000);
  if (paused) await pause();
};

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
      if (action.data === 32) await sleep(trainingMethod.waitDuration);
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
  trainingMethod = await getTrainingMethod();
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
