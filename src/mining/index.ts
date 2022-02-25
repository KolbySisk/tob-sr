import { centerOf, Image, OptionalSearchParameters, Region, screen, sleep } from '@nut-tree/nut-js';
import iohook from 'iohook';
import { clickPoint, getFuzzyNumber, randomSleep } from '../utils';
import { ScriptInfo } from './types';
import { runSetup } from './utils';

import '@nut-tree/template-matcher';

let paused = false;

const mineOre = async (watchRegion: Region, oreImage: Image) => {
  return new Promise<void>(async (resolve) => {
    try {
      const fullSearchOptionsConfiguration = new OptionalSearchParameters(watchRegion, 0.98);
      const foundOreLocation = await screen.find(oreImage, fullSearchOptionsConfiguration);

      await clickPoint({
        point: await centerOf(foundOreLocation),
        speed: 1000,
        fuzzy: true,
      });

      while (true) {
        try {
          await screen.find(oreImage, fullSearchOptionsConfiguration);
        } catch {
          resolve();
        }
        await sleep(200);
      }
    } catch {}
  });
};

const runBot = async (scriptInfo: ScriptInfo) => {
  paused = false;

  while (true) {
    if (!paused) {
      await mineOre(scriptInfo.watchRegion!, scriptInfo.ore1Image!);
      await mineOre(scriptInfo.watchRegion!, scriptInfo.ore2Image!);
      await mineOre(scriptInfo.watchRegion!, scriptInfo.ore3Image!);
      await randomSleep();
    }
    await sleep(200);
  }
};

export const initControls = () => {
  iohook.on('keypress', (key: { rawcode: number }) => {
    // Exit when backtick is pressed
    if (key.rawcode === 192) process.exit(1);
    // Pause/Resume when p is pressed
    else if (key.rawcode === 80) paused = !paused;
  });
};

const init = async () => {
  initControls();
  const scriptInfo = await runSetup();
  runBot(scriptInfo);
  // dropInventory(scriptInfo.inventoryItemRegions!);
};

init();
