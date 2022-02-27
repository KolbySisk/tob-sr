import { centerOf, Point, Region, sleep } from '@nut-tree/nut-js';
import { clickPoint, getNumberFromRegion, getInventory, randomSleep } from '../utils';
import { ScriptInfo } from './types';
import { runSetup } from './utils';

const getFoodPosition = async (inventoryItemRegions: Region[]): Promise<number> => {
  const inventory = await getInventory(inventoryItemRegions);
  return inventory.findIndex((inventoryItem, index) => inventoryItem && index !== 0 && index !== 1);
};

const checkHealth = async (healthRegion: Region, inventoryItemRegions: Region[]) => {
  const health = await getNumberFromRegion(healthRegion);
  console.log(`Health: ${health}`);
  if (health < 40) {
    const foodPosition = await getFoodPosition(inventoryItemRegions);
    if (foodPosition === -1) {
      // get food from bank
    } else {
      await clickPoint({ point: await centerOf(inventoryItemRegions[foodPosition]), fuzzy: true });
    }
  }
};

const checkNumberOfPouches = async (inventoryItemRegion: Region) => {
  const numberOfPouches = await getNumberFromRegion(inventoryItemRegion);
  console.log(`Pouches: ${numberOfPouches}`);
  if (numberOfPouches === 28) {
    await clickPoint({ point: await centerOf(inventoryItemRegion), fuzzy: true });
  }
};

const clickKnight = async (knightPoint: Point) => {
  await clickPoint({ point: knightPoint, fuzzy: true });
};

const runBot = async (scriptInfo: ScriptInfo) => {
  while (true) {
    // check for movement
    // check health
    // if health is below X, check inv -> find food, eat. If no food, bank then go back to position.
    // check number of pouches, if 28 click pouch
    // click knight

    await checkHealth(scriptInfo.healthRegion, scriptInfo.inventoryItemRegions);
    await checkNumberOfPouches(scriptInfo.inventoryItemRegions[1]);
    await clickKnight(scriptInfo.knightPoint);

    await randomSleep();
    await sleep(200);
  }
};

export const init = async () => {
  const scriptInfo = await runSetup();
  runBot(scriptInfo);
};
