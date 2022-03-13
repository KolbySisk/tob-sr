import { centerOf, imageResource, Key, keyboard, mouse, Point, sleep } from '@nut-tree/nut-js';
import {
  clickMinimap,
  clickPoint,
  findAndClickImage,
  findImageRegion,
  getFuzzyNumber,
  longClickPoint,
  moveMouseDown,
  randomSleep,
} from '../utils';

import '@nut-tree/template-matcher';
import { state } from '..';

let runCount = 0;
const startingNecklaceChargeCount = 16;

const fillPouches = async () => {
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

const emptyPouches = async () => {
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

const teleportToDuelArena = async () => {
  if (!state.inventoryItemRegions) throw new Error('state.inventoryItemRegions required');

  await keyboard.type(Key.F4);
  await keyboard.type(Key.F3);
  await sleep(1000);

  const ringRegion = await findImageRegion({
    image: await imageResource(`rune-crafting/ring.png`),
    numberOfRetries: 1,
  });
  if (!ringRegion) throw new Error('ring not found');

  await longClickPoint({ point: await centerOf(ringRegion) });

  const duelArenaFound = await findAndClickImage(`rune-crafting/duel-arena.png`, 1, 0.95, false);
  if (!duelArenaFound) {
    await findAndClickImage(`rune-crafting/duel-arena2.png`, 1, 0.95);
  }
};

const teleportToCastleWars = async () => {
  if (!state.inventoryItemRegions) throw new Error('state.inventoryItemRegions required');

  await keyboard.type(Key.F3);

  const ringRegion = await findImageRegion({
    image: await imageResource(`rune-crafting/ring.png`),
    numberOfRetries: 1,
  });
  if (!ringRegion) throw new Error('ring not found');

  await longClickPoint({ point: await centerOf(ringRegion) });
  await findAndClickImage(`rune-crafting/castle-wars.png`, 1);
};

const getNewRing = async () => {
  if (!state.inventoryItemRegions) throw new Error('state.inventoryItemRegions required');

  const ringRegion = await findImageRegion({
    image: await imageResource(`rune-crafting/ring-bank.png`),
    numberOfRetries: 1,
  });
  if (!ringRegion) throw new Error('ring not found');

  await longClickPoint({ point: await centerOf(ringRegion) });
  await findAndClickImage(`rune-crafting/withdraw-1.png`, 1);
  await sleep(1000);

  await findAndClickImage(`rune-crafting/close.png`, 2, 0.94);
  await sleep(1000);

  await keyboard.type(Key.F4);
  await keyboard.type(Key.F1);

  const inventoryItem8: Point = await centerOf(state.inventoryItemRegions[7]);
  await clickPoint({ point: inventoryItem8 });

  await findAndClickImage(`rune-crafting/bank.png`, 2, 0.92);
};

const getNewNecklace = async () => {
  if (!state.inventoryItemRegions) throw new Error('state.inventoryItemRegions required');

  const necklaceRegion = await findImageRegion({
    image: await imageResource(`rune-crafting/necklace.png`),
    numberOfRetries: 1,
  });
  if (!necklaceRegion) throw new Error('necklace not found');

  await longClickPoint({ point: await centerOf(necklaceRegion) });
  await findAndClickImage(`rune-crafting/withdraw-1.png`, 1);
  await sleep(1000);

  await findAndClickImage(`rune-crafting/close.png`, 2, 0.94);
  await sleep(1000);

  await keyboard.type(Key.F4);
  await keyboard.type(Key.F1);

  const inventoryItem8: Point = await centerOf(state.inventoryItemRegions[7]);
  await clickPoint({ point: inventoryItem8 });

  await findAndClickImage(`rune-crafting/bank.png`, 2, 0.92);
};

const runBot = async () => {
  while (true) {
    await sleep(2000);

    await findAndClickImage(`rune-crafting/essence.png`, 2);
    await sleep(1000);

    await findAndClickImage(`rune-crafting/close.png`, 2, 0.94);
    await sleep(1000);

    await teleportToDuelArena();
    await sleep(3000);

    await clickMinimap(50, 3);
    await sleep(13000);

    await findAndClickImage(`rune-crafting/ruins.png`, 2);
    await sleep(3000);

    await clickMinimap(70, 70);
    await sleep(2000);

    await keyboard.type(Key.F2);
    await sleep(500);

    await findAndClickImage(`rune-crafting/imbue.png`, 3, 0.94);
    await keyboard.type(Key.F1);
    await findAndClickImage(`rune-crafting/earth-rune.png`, 1);
    await findAndClickImage(`rune-crafting/alter.png`, 1);
    await sleep(2000);

    await teleportToCastleWars();
    await sleep(5000);

    await findAndClickImage(`rune-crafting/bank-icon.png`, 2, 0.94);
    await sleep(5000);

    const bankClicked = await findAndClickImage(`rune-crafting/bank.png`, 8, 0.94, false);
    if (!bankClicked) {
      await findAndClickImage(`rune-crafting/bank2.png`, 8, 0.94);
    }
    await sleep(2000);

    await findAndClickImage(`rune-crafting/lava-rune.png`, 2, 0.94);

    runCount++;

    if (runCount % 4 === 0) {
      await getNewRing();
    }

    if (runCount % 16 === 0 || runCount === startingNecklaceChargeCount) {
      await getNewNecklace();
    }

    console.log(`run count: ${runCount}`);
  }
};

export const init = async () => {
  runBot();
};
