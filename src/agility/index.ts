import { centerOf, imageResource, sleep } from '@nut-tree/nut-js';
import { clickMinimap, clickPoint, findImageRegion, getFuzzyNumber, randomSleep } from '../utils';

import '@nut-tree/template-matcher';

export type Obstacle = {
  name: string;
  imageName: string;
  preImageName?: string;
  imageAtMarkName?: string;
  sleepTime: number;
  failFunction?: () => void;
};

let obstacleStep = 0;

const obstacles: Obstacle[] = [
  {
    name: 'basket',
    imageName: 'basket',
    sleepTime: 4800,
  },
  {
    name: 'stall',
    imageName: 'stall',
    sleepTime: 6100,
  },
  {
    name: 'window',
    imageName: 'window',
    preImageName: 'prewindow',
    sleepTime: 6600,
    failFunction: async () => {
      await clickMinimap(55, 80);
      await sleep(8000);
    },
  },
  {
    name: 'cactus',
    imageName: 'cactus',
    sleepTime: 4450,
    failFunction: async () => {
      await clickMinimap(35, 85);
      await sleep(8000);
    },
  },
  {
    name: 'tree',
    imageName: 'tree',
    sleepTime: 8000,
  },
  {
    name: 'wall',
    imageName: 'wall',
    sleepTime: 4200,
  },
  {
    name: 'monkeybars',
    imageName: 'monkeybars',
    imageAtMarkName: 'monkeybars-mark',
    sleepTime: 10000,
  },
  {
    name: 'tree2',
    imageName: 'tree2',
    imageAtMarkName: 'tree2-mark',
    sleepTime: 6600,
  },
  {
    name: 'dryline',
    imageName: 'dryline',
    sleepTime: 6200,
  },
];

const attemptObstacle = async (obstacle: Obstacle, markFound: boolean) => {
  console.log(`Attempting ${obstacle.name} obstacle`);

  const preImageRegion = obstacle.preImageName
    ? await findImageRegion({
        image: await imageResource(`agility/${obstacle.preImageName}.png`),
        numberOfRetries: 1,
      })
    : true;

  const imageRegion = await findImageRegion({
    image: await imageResource(
      `agility/${
        markFound && obstacle.imageAtMarkName ? obstacle.imageAtMarkName : obstacle.imageName
      }.png`
    ),
    numberOfRetries: 2,
  });

  if (preImageRegion && imageRegion) {
    await clickPoint({
      point: await centerOf(imageRegion),
      fuzzy: true,
    });

    await sleep(getFuzzyNumber(obstacle.sleepTime + 500, 500));

    obstacleStep++;
  } else {
    if (obstacle.failFunction) {
      console.log(`Failed attempting ${obstacle.name}. Running fail function`);
      await obstacle.failFunction();
      obstacleStep = 0;
    } else {
      throw new Error(`Obstacle ${obstacle.name} failed`);
    }
  }
};

const searchForMark = async () => {
  const imageRegion = await findImageRegion({
    image: await imageResource(`agility/mark.png`),
    numberOfRetries: 1,
  });

  if (imageRegion) {
    await clickPoint({
      point: await centerOf(imageRegion),
      fuzzy: true,
    });

    await sleep(5000);

    return true;
  }

  return false;
};

const runBot = async () => {
  while (true) {
    while (obstacleStep !== 9) {
      const markFound = await searchForMark();
      await attemptObstacle(obstacles[obstacleStep], markFound);
    }

    await clickMinimap(50, 98);
    await sleep(7000);

    await clickMinimap(25, 92);
    await sleep(9000);

    obstacleStep = 0;

    await randomSleep();
    await sleep(200);
  }
};

export const init = async () => {
  runBot();
};
