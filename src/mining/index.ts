import { centerOf, Image, OptionalSearchParameters, Region, screen, sleep } from '@nut-tree/nut-js';
import { clickPoint, dropInventory, getInventory, randomSleep } from '../utils';
import { ScriptInfo } from './types';
import { runSetup } from './utils';
import { paused, pause } from '../';

import '@nut-tree/template-matcher';

const checkInventory = async (inventoryItemRegions: Region[]) => {
  const inventory = await getInventory(inventoryItemRegions);

  if (inventory.filter((inventory) => inventory).length === 28) {
    await dropInventory(inventoryItemRegions);
  }
};

const mineOre = async (watchRegion: Region, oreImage: Image) => {
  if (paused) await pause();

  return new Promise<void>(async (resolve) => {
    try {
      const fullSearchOptionsConfiguration = new OptionalSearchParameters(watchRegion, 0.96);
      const foundOreLocation = await screen.find(oreImage, fullSearchOptionsConfiguration);

      await clickPoint({
        point: await centerOf(foundOreLocation),
        speed: 1000,
        fuzzy: true,
      });

      await sleep(500);

      let checkCount = 0;

      const checkMinedInterval = setInterval(async () => {
        try {
          checkCount++;

          // If nothing found this will throw, when it throws we assume ore is mined
          await screen.find(oreImage, fullSearchOptionsConfiguration);

          if (checkCount > 50) {
            console.log('Waiting too long, something is wrong. Resolve and try to continue.');
            resolve();
          }
        } catch (error) {
          console.log('ore mined');
          clearInterval(checkMinedInterval);
          resolve();
        }
      }, 200);
    } catch (error) {
      console.log(error);
      resolve();
    }
  });
};

const runBot = async (scriptInfo: ScriptInfo) => {
  while (true) {
    await checkInventory(scriptInfo.inventoryItemRegions);
    await mineOre(scriptInfo.watchRegion, scriptInfo.ore1Image);

    await checkInventory(scriptInfo.inventoryItemRegions);
    await mineOre(scriptInfo.watchRegion, scriptInfo.ore2Image);

    await checkInventory(scriptInfo.inventoryItemRegions);
    await mineOre(scriptInfo.watchRegion, scriptInfo.ore3Image);

    await randomSleep();

    await sleep(200);
  }
};

export const init = async () => {
  const scriptInfo = await runSetup();
  runBot(scriptInfo);
};
