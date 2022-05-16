import { sleep } from '@nut-tree/nut-js';
import { randomSleep } from '../utils';

import '@nut-tree/template-matcher';
import { setAllTraps } from './utils';

const runBot = async () => {
  while (true) {
    await setAllTraps();

    await randomSleep();
    await sleep(200);
  }
};

export const init = async () => {
  runBot();
};
