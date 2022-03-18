import inquirer from 'inquirer';
import { Point, centerOf, sleep, imageResource, keyboard, Key } from '@nut-tree/nut-js';
import {
  findAndClickImage,
  findImageRegion,
  longClickPoint,
  getSmartFuzzyNumber,
  clickPoint,
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

export const teleportToDuelArena = async () => {
  if (!state.inventoryItemRegions) throw new Error('state.inventoryItemRegions required');

  const ringRegion = await findImageRegion({
    image: await imageResource(`rune-crafting/ring.png`),
    numberOfRetries: 3,
  });
  if (!ringRegion) throw new Error('ring not found');

  await longClickPoint({ point: await centerOf(ringRegion) });

  const duelArenaFound = await findAndClickImage(`rune-crafting/duel-arena.png`, 1, 0.95, false);
  if (!duelArenaFound) {
    await findAndClickImage(`rune-crafting/duel-arena2.png`, 1, 0.95);
  }
};

export const teleportToCastleWars = async () => {
  await keyboard.type(Key.F3);

  const ringRegion = await findImageRegion({
    image: await imageResource(`rune-crafting/ring.png`),
    numberOfRetries: 3,
  });
  if (!ringRegion) throw new Error('ring not found');

  await longClickPoint({ point: await centerOf(ringRegion) });
  await findAndClickImage(`rune-crafting/castle-wars.png`, 1);
};

export const getNewRing = async () => {
  if (!state.inventoryItemRegions) throw new Error('state.inventoryItemRegions required');

  const ringRegion = await findImageRegion({
    image: await imageResource(`rune-crafting/ring-bank.png`),
    numberOfRetries: 1,
  });
  if (!ringRegion) throw new Error('ring not found');

  await longClickPoint({ point: await centerOf(ringRegion) });
  await sleep(500);
  await findAndClickImage(`rune-crafting/withdraw-1.png`, 1);
  await sleep(getSmartFuzzyNumber(1400));

  const inventoryItem8: Point = await centerOf(state.inventoryItemRegions[7]);
  await longClickPoint({ point: inventoryItem8 });
  await findAndClickImage(`rune-crafting/wear.png`, 2);
};

export const getNewNecklace = async () => {
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

export const findAndClickRuins = async (retryCount = 0) => {
  if (retryCount === 5) throw new Error('Error finding Ruins');

  const ruinsFound = await findAndClickImage(`rune-crafting/ruins.png`, 10, 0.955, false);
  if (!ruinsFound) {
    const ruins2Found = await findAndClickImage(`rune-crafting/ruins2.png`, 10, 0.955, false);
    if (!ruins2Found) {
      const ruins3Found = await findAndClickImage(`rune-crafting/ruins3.png`, 10, 0.955, false);
      if (!ruins3Found) {
        const ruins4Found = await findAndClickImage(`rune-crafting/ruins4.png`, 10, 0.955, false);
        if (!ruins4Found) await findAndClickRuins(retryCount + 1);
      }
    }
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

export const drinkEnergyPot = async () => {
  if (!state.inventoryItemRegions) throw new Error('state.inventoryItemRegions required');

  const energyRegion = await findImageRegion({
    image: await imageResource(`rune-crafting/energy.png`),
    numberOfRetries: 1,
  });
  if (!energyRegion) throw new Error('energy not found');

  await longClickPoint({ point: await centerOf(energyRegion) });
  await sleep(500);
  await findAndClickImage(`rune-crafting/withdraw-1.png`, 1);
  await sleep(getSmartFuzzyNumber(1000));

  const inventoryItem8: Point = await centerOf(state.inventoryItemRegions[7]);
  await longClickPoint({ point: inventoryItem8 });
  await sleep(500);
  await findAndClickImage(`rune-crafting/drink.png`, 1);
  await sleep(800);
  await clickPoint({ point: await centerOf(state.inventoryItemRegions[7]) });
};
