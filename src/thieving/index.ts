import { imageResource, Point, randomPointIn, Region, sleep } from '@nut-tree/nut-js';
import {
  clickPoint,
  findAndClickImage,
  findImageRegion,
  getSmartFuzzyNumber,
  pause,
  randomSleep,
} from '../utils';

import '@nut-tree/template-matcher';
import { state } from '..';
import { getKnightPoint } from './utils';

let attemptCount = 0;

const healthRegion = new Region(1431, 87, 126, 94);

const checkHealthAndHeal = async () => {
  const healths = [60, 61, 62, 63];

  for (const health of healths) {
    const lowHealthFound = await findImageRegion({
      image: await imageResource(`thieving/health-${health}.png`),
      numberOfRetries: 0,
      confidence: 0.97,
      regionToSearch: healthRegion,
    });

    if (lowHealthFound) {
      const foodFound = await findAndClickImage(`thieving/monkfish.png`, 1, 0.95, false);
      if (!foodFound) {
        console.log('Out of food');
        state.paused = true;
      }
      return;
    }
  }
};

const runBot = async (knightPoint: Point) => {
  if (!state || !state.inventoryItemRegions) throw new Error('No inventory state!');

  while (true) {
    if (state.paused) await pause();

    await clickPoint({ point: knightPoint });
    attemptCount++;

    if (attemptCount % 40 === 0) {
      await sleep(1000);
      await clickPoint({ point: await randomPointIn(state.inventoryItemRegions[7]) });
      await sleep(100);
      await clickPoint({ point: await randomPointIn(state.inventoryItemRegions[7]) });
    }

    await checkHealthAndHeal();

    await sleep(getSmartFuzzyNumber(200));

    if (attemptCount % 50 === 0) {
      await randomSleep();
    }
  }
};

export const init = async () => {
  const knightPoint = await getKnightPoint();
  runBot(knightPoint);
};
