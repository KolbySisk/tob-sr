import inquirer from 'inquirer';
import {
  Point,
  centerOf,
  sleep,
  imageResource,
  randomPointIn,
  Region,
  keyboard,
  Key,
} from '@nut-tree/nut-js';
import {
  findAndClickImage,
  findImageRegion,
  longClickPoint,
  getSmartFuzzyNumber,
  clickPoint,
  waitUntilStationaryImageFound,
  getFuzzyPoint,
  waitUntilImageFound,
} from '../utils';
import { state } from '..';

export const fillPouches = async () => {
  if (!state.inventoryItemRegions) throw new Error('state.inventoryItemRegions required');

  const inventoryItem1: Point = await centerOf(state.inventoryItemRegions[0]);
  await longClickPoint({ point: inventoryItem1 });
  await findAndClickImage(`rune-crafting/fill.png`, 2);

  const inventoryItem2: Point = await centerOf(state.inventoryItemRegions[1]);
  await longClickPoint({ point: inventoryItem2 });
  await findAndClickImage(`rune-crafting/fill.png`, 2);

  const inventoryItem3: Point = await centerOf(state.inventoryItemRegions[2]);
  await longClickPoint({ point: inventoryItem3 });
  await findAndClickImage(`rune-crafting/fill.png`, 2);
};

export const emptyPouches = async () => {
  if (!state.inventoryItemRegions) throw new Error('state.inventoryItemRegions required');

  const inventoryItem1: Point = await centerOf(state.inventoryItemRegions[0]);
  await longClickPoint({ point: inventoryItem1 });
  await findAndClickImage(`rune-crafting/empty.png`, 2);

  const inventoryItem2: Point = await centerOf(state.inventoryItemRegions[1]);
  await longClickPoint({ point: inventoryItem2 });
  await findAndClickImage(`rune-crafting/empty.png`, 2);

  const inventoryItem3: Point = await centerOf(state.inventoryItemRegions[2]);
  await longClickPoint({ point: inventoryItem3 });
  await findAndClickImage(`rune-crafting/empty.png`, 2);
};

export const getNewNecklace = async () => {
  console.log('getting new necklace');

  if (!state.inventoryItemRegions) throw new Error('state.inventoryItemRegions required');

  const necklaceRegion = await findImageRegion({
    image: await imageResource(`rune-crafting/necklace.png`),
    numberOfRetries: 1,
  });
  if (!necklaceRegion) throw new Error('necklace not found');

  await longClickPoint({ point: await centerOf(necklaceRegion) });
  await sleep(500);
  await findAndClickImage(`rune-crafting/withdraw-1.png`, 1);
  await sleep(getSmartFuzzyNumber(1000));

  const inventoryItem8: Point = await centerOf(state.inventoryItemRegions[7]);
  await longClickPoint({ point: inventoryItem8 });
  await findAndClickImage(`rune-crafting/wear.png`, 2);
};

export const findAndClickRuins = async (): Promise<boolean> => {
  console.log('clicking ruins');

  try {
    const ruinsRegion = await waitUntilImageFound(
      await imageResource(`rune-crafting/ruins.png`),
      20000
    );

    await clickPoint({ point: getFuzzyPoint(await centerOf(ruinsRegion!)) });
    return true;
  } catch (error) {
    return false;
  }
};

export const getEssenceType = async (): Promise<'pure' | 'daeyalt'> => {
  const response = await inquirer.prompt([
    {
      type: 'list',
      name: 'type',
      message: 'Select essence type',
      choices: ['pure', 'daeyalt'],
    },
  ]);

  return response.type;
};

export const clickCactusOnMiniMap = async () => {
  console.log('clicking cactus');

  const cactusRegion = await waitUntilStationaryImageFound(
    await imageResource(`rune-crafting/cactus.png`),
    10000
  );
  if (!cactusRegion) throw new Error();

  await sleep(1000);

  const x = cactusRegion.left + cactusRegion.width / 2;
  const y = cactusRegion.top;
  const point = new Point(x, y);
  await clickPoint({ point, fuzzy: false });
};

export const clickJewelryBox = async () => {
  console.log('clicking jewelry box');

  // const jewelryBoxRegion = await waitUntilImageFound(
  //   await imageResource(`rune-crafting/jewelry-box.png`),
  //   2000
  // );

  // await clickPoint({ point: await centerOf(jewelryBoxRegion) });

  const jewelryBoxRegion = new Region(1210, 187, 46, 43);
  await clickPoint({ point: await centerOf(jewelryBoxRegion), fuzzy: true });
};

export const openBank = async (retryCount = 0) => {
  console.log('opening bank');

  if (retryCount === 6) throw new Error('Could not open bank');

  try {
    const foundBankRegion = await waitUntilStationaryImageFound(
      await imageResource(`rune-crafting/${retryCount % 1 === 0 ? 'bank' : 'bank2'}.png`),
      5000
    );

    await clickPoint({ point: await centerOf(foundBankRegion), fuzzy: true });

    await waitUntilImageFound(await imageResource(`rune-crafting/necklace.png`), 2000, 0.94);
  } catch (error) {
    await openBank(retryCount + 1);
  }
};

export const clickPool = async () => {
  await findAndClickImage(`rune-crafting/pool.png`, 2);
};

export const teleportToHouse = async (teleTabRegion: Region, retryCount = 0) => {
  console.log('teleporting to house');

  if (retryCount === 6) throw new Error('Could not teleport to house');

  await clickPoint({ point: await randomPointIn(teleTabRegion) });
  try {
    await waitUntilStationaryImageFound(await imageResource(`rune-crafting/pool.png`), 10000);
  } catch (error) {
    await teleportToHouse(teleTabRegion, retryCount + 1);
  }
};

export const teleportToDuelArena = async () => {
  console.log('teleporting to duel arena');

  const duelArenaOptionRegion = await waitUntilImageFound(
    await imageResource(`rune-crafting/duel-arena.png`),
    10000
  );
  await clickPoint({ point: await centerOf(duelArenaOptionRegion), fuzzy: true });
  await waitUntilImageFound(await imageResource(`rune-crafting/axe.png`), 5000);
};

export const castImbue = async (retryCount = 0) => {
  console.log('casting imbue');

  if (retryCount === 3) throw new Error('Could not cast imbue');

  await keyboard.type(Key.F2);
  await sleep(getSmartFuzzyNumber(500));
  const imbueFound = await findAndClickImage(`rune-crafting/imbue.png`, 5, 0.94);

  if (!imbueFound) await castImbue(retryCount + 1);

  await sleep(getSmartFuzzyNumber(800));
};

export const useEarthRunesOnAlter = async (earthRunesregion: Region) => {
  console.log('clicking earth rune');
  await keyboard.type(Key.F1);
  await sleep(getSmartFuzzyNumber(700));
  await clickPoint({ point: await randomPointIn(earthRunesregion) });
  await sleep(getSmartFuzzyNumber(700));

  console.log('clicking alter');
  await findAndClickImage(`rune-crafting/alter.png`, 10);
  await sleep(getSmartFuzzyNumber(2000));
};
