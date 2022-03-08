import { centerOf, imageResource, sleep } from '@nut-tree/nut-js';
import { clickMinimap, clickPoint, findImageRegion, getFuzzyNumber, randomSleep } from '../utils';

import '@nut-tree/template-matcher';

export type Obstacle = {
  name: string;
  imageName: string;
  preImageName?: string;
  retryImageName?: string;
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
    sleepTime: 5600,
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
    sleepTime: 10000,
  },
  {
    name: 'tree2',
    imageName: 'tree2',
    retryImageName: 'retree2',
    sleepTime: 6600,
  },
  {
    name: 'dryline',
    imageName: 'dryline',
    sleepTime: 6200,
  },
];

const attemptObstacle = async (obstacle: Obstacle) => {
  console.log(`Attempting ${obstacle.name} obstacle`);

  const preImageRegion = obstacle.preImageName
    ? await findImageRegion(await imageResource(`agility/${obstacle.preImageName}.png`))
    : true;

  const imageRegion = await findImageRegion(
    await imageResource(`agility/${obstacle.imageName}.png`)
  );

  if (preImageRegion && imageRegion) {
    await clickPoint({
      point: await centerOf(imageRegion),
      speed: 1000,
      fuzzy: true,
    });

    await sleep(getFuzzyNumber(obstacle.sleepTime + 500, 500));

    obstacleStep++;
  } else {
    if (obstacle.failFunction) {
      console.log(`Failed attempting ${obstacle.name}. Running fail function`);
      await obstacle.failFunction();
      obstacleStep = 0;
    } else if (obstacle.retryImageName) {
      const retryImageRegion = await findImageRegion(
        await imageResource(`agility/${obstacle.retryImageName}.png`)
      );
      if (retryImageRegion) {
        await clickPoint({
          point: await centerOf(retryImageRegion),
          speed: 1000,
          fuzzy: true,
        });
      } else {
        throw new Error();
      }
    } else {
      throw new Error();
    }
  }
};

const runBot = async () => {
  while (true) {
    while (obstacleStep !== 9) {
      await attemptObstacle(obstacles[obstacleStep]);
    }

    await clickMinimap(50, 100);
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
