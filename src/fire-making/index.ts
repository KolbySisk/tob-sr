import { centerOf, Region, screen, sleep } from '@nut-tree/nut-js';
import { state } from '..';
import {
  clickPoint,
  getFuzzyNumber,
  inventoryItemRegionHasItem,
  pause,
  randomSleep,
} from '../utils';
import { ScriptInfo } from './types';
import { findBankBoothRegion, runSetup } from './utils';

let useStartPoint1 = false;
let logsBurnedCount = 0;

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

  await sleep(getFuzzyNumber(4000, 50));

  logsBurnedCount++;
};

const checkLogsAreBurning = async (inventoryItemRegions: Region[]) => {
  let failCount = 0;

  if (await inventoryItemRegionHasItem(inventoryItemRegions[logsBurnedCount])) failCount++;
  if (await inventoryItemRegionHasItem(inventoryItemRegions[logsBurnedCount - 1])) failCount++;
  if (await inventoryItemRegionHasItem(inventoryItemRegions[logsBurnedCount - 2])) failCount++;

  if (failCount >= 2) throw new Error(`Log didn't burn`);
};

const runBot = async (scriptInfo: ScriptInfo) => {
  if (!state.inventoryItemRegions) throw new Error('state.inventoryItemRegions not found');

  while (true) {
    await sleep(2000);

    await lightLog(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await checkLogsAreBurning(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await checkLogsAreBurning(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await checkLogsAreBurning(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await checkLogsAreBurning(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await checkLogsAreBurning(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await checkLogsAreBurning(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await checkLogsAreBurning(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await checkLogsAreBurning(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await checkLogsAreBurning(state.inventoryItemRegions);

    useStartPoint1 = !useStartPoint1;
    logsBurnedCount = 0;

    await clickPoint({
      point: scriptInfo.eastMinimapPoint,
      speed: 1000,
      fuzzy: false,
    });

    await sleep(7000);

    console.log('Searching for bank');
    const bankRegion = await findBankBoothRegion(scriptInfo.bankBoothImage);
    await clickPoint({
      point: await centerOf(bankRegion),
      speed: 10000,
      fuzzy: true,
    });

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

    await randomSleep();
  }
};

export const init = async () => {
  const scriptInfo = await runSetup();
  runBot(scriptInfo);
};
