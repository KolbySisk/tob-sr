import { centerOf, Image, OptionalSearchParameters, Region, screen, sleep } from '@nut-tree/nut-js';
import iohook from 'iohook';
import { clickPoint, dropInventory, randomSleep } from '../utils';
import { ScriptInfo } from './types';
import { runSetup } from './utils';

import '@nut-tree/template-matcher';

let paused = false;
let oreCount = 0;

const checkInventory = async (inventoryItemRegions: Region[]) => {
  if (oreCount === 28) {
    await dropInventory(inventoryItemRegions);
    oreCount = 0;
  }

  return;
};

const pause = async () => {
  await sleep(1000);
  if (paused) await pause();
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

      const checkMinedInterval = setInterval(async () => {
        try {
          await screen.find(oreImage, fullSearchOptionsConfiguration);
        } catch (error) {
          console.log('ore mined');
          oreCount++;
          clearInterval(checkMinedInterval);
          resolve();
        }
      }, 200);
    } catch (error) {}
  });
};

const runBot = async (scriptInfo: ScriptInfo) => {
  paused = false;

  while (true) {
    await mineOre(scriptInfo.watchRegion, scriptInfo.ore1Image);
    await checkInventory(scriptInfo.inventoryItemRegions);

    await mineOre(scriptInfo.watchRegion, scriptInfo.ore2Image);
    await checkInventory(scriptInfo.inventoryItemRegions);

    await mineOre(scriptInfo.watchRegion, scriptInfo.ore3Image);
    await checkInventory(scriptInfo.inventoryItemRegions);

    await randomSleep();

    await sleep(200);
  }
};

export const initControls = () => {
  iohook.on('keypress', (key: { rawcode: number }) => {
    // Exit when backtick is pressed
    if (key.rawcode === 192) process.exit(1);
    // Pause/Resume when p is pressed
    else if (key.rawcode === 80) {
      console.log(paused ? 'resuming' : 'pausing');
      paused = !paused;
    }
  });
};

const init = async () => {
  initControls();
  const scriptInfo = await runSetup();
  runBot(scriptInfo);
};

init();
