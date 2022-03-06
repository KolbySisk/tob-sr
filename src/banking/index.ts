import _ from 'lodash';
import { sleep } from '@nut-tree/nut-js';
import { clickPoint, colorCheck, getFuzzyNumber, pause, pressKey, randomSleep } from '../utils';
import { Actions } from '../types';
import { getTrainingMethod, runSetup } from './utils';
import { TrainingMethod } from './types';
import { state } from '..';

export let trainingMethod: TrainingMethod;

const iterationsToRun = 2000; // TODO: move to console
let iterationCount = 0;

const doActions = async (actions: Actions) => {
  await randomSleep();

  for (const action of actions) {
    if (state.paused) await pause();

    // Perform action - click
    if (action.actionType === 'click') {
      // Check color of click position is the expected color
      await colorCheck(action.data.point, action.data.color);

      // Move mouse to a fuzzy position and click
      await clickPoint({ point: action.data.point, fuzzy: true });

      // randomize the delay after each click - random ms between 500 - 1500
      if (trainingMethod.waitDuration !== 0) await sleep(getFuzzyNumber(1000, 500));
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
  while (iterationCount < iterationsToRun) {
    await doActions(actions);
    await sleep(200);
  }
};

export const init = async () => {
  trainingMethod = await getTrainingMethod();
  const actions = await runSetup();
  console.log(JSON.stringify(actions));
  runBot(actions);
};

/**
 * Ideas:
 * - Save actions, run last actions
 */
