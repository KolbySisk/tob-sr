import { centerOf, Image, OptionalSearchParameters, Region, screen, sleep } from '@nut-tree/nut-js';
import { state } from '..';
import { clickPoint, pause, randomSleep } from '../utils';
import { ScriptInfo } from './types';
import { runSetup } from './utils';

let useStartPoint1 = false;
let logsBurnedCount = 0;
const searchOptions = new OptionalSearchParameters(undefined, 0.96);

const lightLog = async (inventoryItemRegions: Region[]) => {
  if (state.paused) await pause();

  const tinderBoxRegion = inventoryItemRegions[0];
  const logInventoryItemRegion = inventoryItemRegions[logsBurnedCount + 1];

  await clickPoint({
    point: await centerOf(tinderBoxRegion),
    speed: 1000,
    fuzzy: true,
  });

  await clickPoint({
    point: await centerOf(logInventoryItemRegion),
    speed: 1000,
    fuzzy: true,
  });

  await sleep(3000);

  logsBurnedCount++;
};

const runBot = async (scriptInfo: ScriptInfo) => {
  while (true) {
    await lightLog(scriptInfo.inventoryItemRegions);
    await lightLog(scriptInfo.inventoryItemRegions);
    await lightLog(scriptInfo.inventoryItemRegions);
    await lightLog(scriptInfo.inventoryItemRegions);
    await lightLog(scriptInfo.inventoryItemRegions);
    await lightLog(scriptInfo.inventoryItemRegions);
    await lightLog(scriptInfo.inventoryItemRegions);
    await lightLog(scriptInfo.inventoryItemRegions);
    await lightLog(scriptInfo.inventoryItemRegions);
    await lightLog(scriptInfo.inventoryItemRegions);
    await lightLog(scriptInfo.inventoryItemRegions);
    await lightLog(scriptInfo.inventoryItemRegions);
    await lightLog(scriptInfo.inventoryItemRegions);
    await lightLog(scriptInfo.inventoryItemRegions);
    await lightLog(scriptInfo.inventoryItemRegions);
    await lightLog(scriptInfo.inventoryItemRegions);
    await lightLog(scriptInfo.inventoryItemRegions);
    await lightLog(scriptInfo.inventoryItemRegions);
    await lightLog(scriptInfo.inventoryItemRegions);
    await lightLog(scriptInfo.inventoryItemRegions);
    await lightLog(scriptInfo.inventoryItemRegions);
    await lightLog(scriptInfo.inventoryItemRegions);
    await lightLog(scriptInfo.inventoryItemRegions);
    await lightLog(scriptInfo.inventoryItemRegions);
    await lightLog(scriptInfo.inventoryItemRegions);
    await lightLog(scriptInfo.inventoryItemRegions);
    await lightLog(scriptInfo.inventoryItemRegions);

    useStartPoint1 = !useStartPoint1;
    logsBurnedCount = 0;

    await clickPoint({
      point: scriptInfo.eastMinimapPoint,
      speed: 1000,
      fuzzy: false,
    });

    await sleep(4000);

    await clickPoint({
      point: scriptInfo.eastMinimapPoint,
      speed: 1000,
      fuzzy: false,
    });

    await sleep(7000);

    const bankRegion = await screen.waitFor(scriptInfo.bankBoothImage, 10000, 500, searchOptions);
    await clickPoint({
      point: await centerOf(bankRegion),
      speed: 1000,
      fuzzy: true,
    });
    await clickPoint({
      point: await centerOf(bankRegion),
      speed: 1000,
      fuzzy: true,
    });

    // await sleep(3000);

    const logsRegion = await screen.waitFor(scriptInfo.logsImage, 7000, 500);
    await clickPoint({
      point: await centerOf(logsRegion),
      speed: 1000,
      fuzzy: true,
    });

    await clickPoint({
      point: scriptInfo.closeBankPoint,
      speed: 1000,
      fuzzy: true,
    });

    await clickPoint({
      point: useStartPoint1 ? scriptInfo.startPoint1 : scriptInfo.startPoint2,
      speed: 1000,
      fuzzy: true,
    });

    await sleep(1000);
    await randomSleep();
  }
};

export const init = async () => {
  const scriptInfo = await runSetup();
  runBot(scriptInfo);
};
