import { centerOf, randomPointIn, Region, screen, sleep } from '@nut-tree/nut-js';
import { state } from '..';
import {
  clickMinimap,
  clickPoint,
  getFuzzyNumber,
  getInventory,
  getSmartFuzzyNumber,
  pause,
  randomSleep,
} from '../utils';
import { ScriptInfo } from './types';
import { checkLogsAreBurning, findBankBoothRegion, runSetup } from './utils';

let useStartPoint1 = false;
let logsBurnedCount = 0;

const lightLog = async (inventoryItemRegions: Region[]) => {
  if (state.paused) await pause();

  const tinderBoxRegion = inventoryItemRegions[0];
  const logInventoryItemRegion = inventoryItemRegions[logsBurnedCount + 1];

  await clickPoint({
    point: await randomPointIn(tinderBoxRegion),
  });

  await clickPoint({
    point: await randomPointIn(logInventoryItemRegion),
  });

  await sleep(getFuzzyNumber(4000, 50));

  logsBurnedCount++;
};

const bankAndGetLogs = async (
  scriptInfo: ScriptInfo,
  inventoryItemRegions: Region[],
  retryCount = 0
) => {
  if (retryCount === 3) throw new Error('Could not bankAndGetLogs');

  console.log('Searching for bank');
  const bankRegion = await findBankBoothRegion(scriptInfo.bankBoothImage);
  await clickPoint({
    point: await centerOf(bankRegion),
    fuzzy: true,
  });
  await clickPoint({
    point: await centerOf(bankRegion),
    fuzzy: true,
  });
  await sleep(getSmartFuzzyNumber(800));

  const logsRegion = await screen.waitFor(scriptInfo.logsImage, 7000, 500);
  await clickPoint({
    point: await centerOf(logsRegion),
    fuzzy: true,
  });
  await sleep(getSmartFuzzyNumber(800));

  await clickPoint({
    point: scriptInfo.closeBankPoint,
    fuzzy: true,
  });
  await sleep(getSmartFuzzyNumber(800));

  // check if inventory is full of logs
  const inventoryFull =
    (await getInventory(inventoryItemRegions)).filter((inventoryItem) => inventoryItem).length ===
    28;

  if (!inventoryFull) {
    await bankAndGetLogs(scriptInfo, inventoryItemRegions, retryCount + 1);
  }
};

const runBot = async (scriptInfo: ScriptInfo) => {
  if (!state.inventoryItemRegions) throw new Error('state.inventoryItemRegions not found');

  while (true) {
    await sleep(2000);

    await lightLog(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await checkLogsAreBurning(state.inventoryItemRegions, logsBurnedCount);
    await lightLog(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await checkLogsAreBurning(state.inventoryItemRegions, logsBurnedCount);
    await lightLog(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await checkLogsAreBurning(state.inventoryItemRegions, logsBurnedCount);
    await lightLog(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await checkLogsAreBurning(state.inventoryItemRegions, logsBurnedCount);
    await lightLog(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await checkLogsAreBurning(state.inventoryItemRegions, logsBurnedCount);
    await lightLog(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await checkLogsAreBurning(state.inventoryItemRegions, logsBurnedCount);
    await lightLog(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await checkLogsAreBurning(state.inventoryItemRegions, logsBurnedCount);
    await lightLog(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await checkLogsAreBurning(state.inventoryItemRegions, logsBurnedCount);
    await lightLog(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await lightLog(state.inventoryItemRegions);
    await checkLogsAreBurning(state.inventoryItemRegions, logsBurnedCount);

    useStartPoint1 = !useStartPoint1;
    logsBurnedCount = 0;

    // Go towards bank
    await clickMinimap(99, 50);
    await sleep(7000);

    // Find bank and get logs
    await bankAndGetLogs(scriptInfo, state.inventoryItemRegions);

    // Go to a starting point
    await clickPoint({
      point: useStartPoint1 ? scriptInfo.startPoint1 : scriptInfo.startPoint2,
      fuzzy: true,
    });
    await sleep(getSmartFuzzyNumber(800));

    await randomSleep();
  }
};

export const init = async () => {
  const scriptInfo = await runSetup();
  runBot(scriptInfo);
};
