import { centerOf, Image, OptionalSearchParameters, Region, screen, sleep } from '@nut-tree/nut-js';
import { clickPoint, dropInventory, getInventory, pause, randomSleep } from '../utils';
import { ScriptInfo } from './types';
import { runSetup } from './utils';
import { state } from '..';

import '@nut-tree/template-matcher';

const checkInventory = async (inventoryItemRegions: Region[]) => {
  if (state.paused) await pause();

  const inventory = await getInventory(inventoryItemRegions);

  if (inventory.filter((inventory) => inventory).length === 28) {
    await dropInventory(inventoryItemRegions);
  }
};

const mineOre = async (watchRegion: Region, oreImage: Image) => {
  if (state.paused) await pause();

  return new Promise<void>(async (resolve) => {
    try {
      const searchOptions = new OptionalSearchParameters(watchRegion, 0.96);
      const foundOreLocation = await screen.find(oreImage, searchOptions);

      await clickPoint({
        point: await centerOf(foundOreLocation),
        fuzzy: true,
      });

      await sleep(300);

      let checkCount = 0;

      const checkMinedInterval = setInterval(async () => {
        try {
          checkCount++;

          // If nothing found this will throw, when it throws we assume ore is mined
          await screen.find(oreImage, searchOptions);

          if (checkCount > 50) {
            console.log('Waiting too long, something is wrong. Resolve and try to continue.');
            clearInterval(checkMinedInterval);
            resolve();
            return;
          }
        } catch (error) {
          // Ore was successfully mined
          clearInterval(checkMinedInterval);
          resolve();
          return;
        }
      }, 200);
    } catch (error) {
      console.log(error);
      resolve();
      return;
    }
  });
};

const runBot = async (scriptInfo: ScriptInfo) => {
  if (!state.inventoryItemRegions) throw new Error('state.inventoryItemRegions not found');

  while (true) {
    await checkInventory(state.inventoryItemRegions);
    await mineOre(scriptInfo.watchRegion, scriptInfo.ore1Image);

    await checkInventory(state.inventoryItemRegions);
    await mineOre(scriptInfo.watchRegion, scriptInfo.ore2Image);

    await checkInventory(state.inventoryItemRegions);
    await mineOre(scriptInfo.watchRegion, scriptInfo.ore3Image);

    await randomSleep();

    await sleep(200);
  }
};

export const init = async () => {
  const scriptInfo = await runSetup();
  runBot(scriptInfo);
};
