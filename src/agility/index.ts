import { centerOf, imageResource, sleep } from '@nut-tree/nut-js';
import {
  clickMinimap,
  clickPoint,
  findImageRegion,
  getFuzzyNumber,
  randomSleep,
  waitUntilImageFound,
  waitUntilStationaryImageFound,
} from '../utils';

import '@nut-tree/template-matcher';

export type Obstacle = {
  name: string;
  imageName: string;
  successImageName: string;
  preImageName?: string;
  markImageName?: string;
  imageAtMarkName?: string;
  failFunction?: () => void;
};

type ObstacleStep = number;

let obstacleStep: ObstacleStep = 0;
let lapCount = 0;

const obstacles: Obstacle[] = [
  {
    name: 'basket',
    imageName: 'basket',
    successImageName: 'basket-success',
  },
  {
    name: 'stall',
    imageName: 'stall',
    successImageName: 'stall-success',
    markImageName: 'mark-stall',
    imageAtMarkName: 'stall-mark',
  },
  {
    name: 'window',
    imageName: 'window',
    successImageName: 'window-success',
    markImageName: 'mark-window',
    imageAtMarkName: 'window-mark',
    failFunction: async () => {
      await clickMinimap(55, 80);
      await sleep(8000);
    },
  },
  {
    name: 'cactus',
    imageName: 'cactus',
    successImageName: 'cactus-success',
    failFunction: async () => {
      await clickMinimap(35, 85);
      await sleep(8000);
    },
  },
  {
    name: 'tree',
    imageName: 'tree',
    successImageName: 'tree-success',
  },
  {
    name: 'wall',
    imageName: 'wall',
    successImageName: 'wall-success',
  },
  {
    name: 'monkeybars',
    imageName: 'monkeybars',
    successImageName: 'monkeybars-success',
    markImageName: 'mark-monkeybars',
    imageAtMarkName: 'monkeybars-mark',
  },
  {
    name: 'tree2',
    imageName: 'tree2',
    successImageName: 'tree2-success',
    markImageName: 'mark-tree2',
    imageAtMarkName: 'tree2-mark',
  },
  {
    name: 'dryline',
    imageName: 'dryline',
    successImageName: 'dryline-success',
    markImageName: 'mark-dryline',
    imageAtMarkName: 'dryline-mark',
  },
];

const pickUpMark = async (obstacle: Obstacle): Promise<boolean> => {
  if (!obstacle.markImageName) return false;

  const foundMarkRegion = await findImageRegion({
    image: await imageResource(`agility/${obstacle.markImageName}.png`),
    numberOfRetries: 2,
  });
  if (!foundMarkRegion) return false;

  console.log(`Picking up ${obstacle.name} mark`);

  await clickPoint({ point: await centerOf(foundMarkRegion), fuzzy: true });
  await sleep(5000);

  return true;
};

const attemptObstacle = async (obstacle: Obstacle, retryCount = 0): Promise<boolean> => {
  console.log(`Attempting ${obstacle.name} obstacle`);

  if (retryCount === 3) {
    console.log(`Obstacle ${obstacle.name} failed`);
    return false;
  }

  const markFound = await pickUpMark(obstacle);

  const imageRegion = await waitUntilStationaryImageFound(
    await imageResource(`agility/${markFound ? obstacle.imageAtMarkName : obstacle.imageName}.png`),
    10000
  );

  if (imageRegion) {
    await clickPoint({
      point: await centerOf(imageRegion),
      fuzzy: true,
    });

    const obstacleCompletedSuccessfully = await waitUntilStationaryImageFound(
      await imageResource(`agility/${obstacle.successImageName}.png`),
      10000
    );

    if (!obstacleCompletedSuccessfully) await attemptObstacle(obstacle, retryCount + 1);

    return true;
  } else {
    if (obstacle.failFunction) {
      console.log(`Failed attempting ${obstacle.name}. Running fail function`);
      await obstacle.failFunction();
      return false;
    } else {
      return await attemptObstacle(obstacle, retryCount + 1);
    }
  }
};

const goHome = async () => {
  const miniMap1Region = await waitUntilImageFound(
    await imageResource(`agility/minimap1.png`),
    5000
  );
  if (miniMap1Region) {
    console.log('clicking minimap1 region');
    await clickPoint({ point: await centerOf(miniMap1Region) });
  } else {
    console.log('clicking minimap1');
    await clickMinimap(50, 98);
  }
  await waitUntilImageFound(await imageResource(`agility/minimap1-success.png`), 10000);

  const miniMap2Region = await waitUntilImageFound(
    await imageResource(`agility/minimap2.png`),
    5000
  );
  if (miniMap2Region) {
    console.log('clicking minimap2 region');
    await clickPoint({ point: await centerOf(miniMap2Region) });
  } else {
    console.log('clicking minimap2');
    await clickMinimap(28, 92);
  }
  const basketFound = await waitUntilImageFound(await imageResource(`agility/basket.png`), 10000);
  if (!basketFound) {
    // one last try
    const miniMap2Region2 = await waitUntilImageFound(
      await imageResource(`agility/minimap2.png`),
      5000
    );
    if (miniMap2Region2) await clickPoint({ point: await centerOf(miniMap2Region2) });
    else throw new Error('Couldnt get home');
  }
};

const searchForObstacleStep = async (): Promise<ObstacleStep | null> => {
  console.log('Searching for obstacle step...');

  for (const [index, obstacle] of obstacles.entries()) {
    const obstacleImageFound = await findImageRegion({
      image: await imageResource(`agility/${obstacle.imageName}.png`),
      numberOfRetries: 1,
    });

    if (!obstacleImageFound) continue;

    // If we found a match for the first obstacle then just return 0 - there is no previous obstacle to check for success image
    if (obstacle.name === 'basket') return 0;
    // If not, then check for the success image - this just gives us more confidence we're on the obstacle we expect as some images can be a little generic (window)
    else {
      const previousObstacleSuccessImageFound = await findImageRegion({
        image: await imageResource(`agility/${obstacles[index - 1].successImageName}.png`),
        numberOfRetries: 1,
      });

      if (previousObstacleSuccessImageFound) return index;
    }
  }

  return null;
};

const runBot = async () => {
  obstacleStep = (await searchForObstacleStep()) ?? 0;

  while (true) {
    while (obstacleStep !== 9) {
      const obstacleSuccessful = await attemptObstacle(obstacles[obstacleStep]);
      if (obstacleSuccessful) obstacleStep++;
      else {
        const foundObstacleStep = await searchForObstacleStep();
        if (!foundObstacleStep) {
          throw new Error('Shits broke');
        }
        obstacleStep = foundObstacleStep;
      }
    }

    await goHome();

    obstacleStep = 0;

    lapCount++;
    console.log(`${lapCount} laps completed`);

    await randomSleep();
    await sleep(200);
  }
};

export const init = async () => {
  runBot();
};
