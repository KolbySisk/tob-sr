import { sleep } from '@nut-tree/nut-js';
import { findAndClickImage, getSmartFuzzyNumber } from '../utils';

export const goHome = async () => {
  await findAndClickImage(`hunter/home.png`, 10);
  await sleep(getSmartFuzzyNumber(2600));
};

export const setTrap1 = async () => {
  await findAndClickImage(`hunter/tree1.png`, 10);
  await sleep(getSmartFuzzyNumber(2600));
};

export const setAllTraps = async () => {
  await setTrap1();
  await goHome();
};
