import { centerOf, imageResource, Key, keyboard, Point, sleep } from '@nut-tree/nut-js';
import {
  askNumber,
  clickMinimap,
  clickPoint,
  findAndClickImage,
  getFuzzyPoint,
  getSmartFuzzyNumber,
  randomSleep,
  waitUntilImageFound,
  waitUntilStationaryImageFound,
} from '../utils';

import {
  teleportToDuelArena,
  findAndClickRuins,
  teleportToCastleWars,
  getNewRing,
  getNewNecklace,
  getEssenceType,
  drinkEnergyPot,
} from './utils';

import { state } from '..';

let runCount = 0;
let startingNecklaceChargeCount: number;
let essenceType: 'pure' | 'daeyalt';

const runBot = async () => {
  if (!state.inventoryItemRegions) throw new Error('state.inventoryItemRegions required');

  await sleep(getSmartFuzzyNumber(3000));

  while (true) {
    await randomSleep();

    // Get essence from bank
    await findAndClickImage(`rune-crafting/${essenceType}-essence.png`, 2);
    await sleep(getSmartFuzzyNumber(1500));

    // Close bank
    await findAndClickImage(`rune-crafting/close.png`, 2, 0.94);
    await sleep(getSmartFuzzyNumber(500));

    // Teleport to Duel Arena
    await teleportToDuelArena();
    await waitUntilStationaryImageFound(await imageResource(`rune-crafting/axe.png`), 10000);
    await randomSleep();

    // Go to ruins
    await clickMinimap(45, 5);
    await sleep(getSmartFuzzyNumber(8500));

    // Click ruins
    await findAndClickRuins();
    await sleep(getSmartFuzzyNumber(2000));

    await randomSleep();

    // Go to alter
    await clickMinimap(70, 70);

    // Cast imbue
    await keyboard.type(Key.F2);
    await sleep(getSmartFuzzyNumber(500));
    await findAndClickImage(`rune-crafting/imbue.png`, 5, 0.94);
    await sleep(getSmartFuzzyNumber(800));

    // Use earth rune on alter
    await keyboard.type(Key.F1);
    await sleep(getSmartFuzzyNumber(500));
    await clickPoint({ point: await centerOf(state.inventoryItemRegions[0]) });
    await sleep(getSmartFuzzyNumber(600));
    await findAndClickImage(`rune-crafting/alter.png`, 10);
    await sleep(getSmartFuzzyNumber(2000));

    // Teleport to Castle Wars
    await teleportToCastleWars();
    const bankIconRegion = await waitUntilStationaryImageFound(
      await imageResource(`rune-crafting/bank-icon.png`),
      10000,
      0.94
    );

    await randomSleep();

    // Go to bank
    await clickPoint({ point: getFuzzyPoint(await centerOf(bankIconRegion!)) });
    const bankRegion = await waitUntilStationaryImageFound(
      await imageResource(`rune-crafting/bank.png`),
      10000
    );

    // Open bank
    await clickPoint({ point: getFuzzyPoint(await centerOf(bankRegion!)) });
    await waitUntilStationaryImageFound(
      await imageResource(`rune-crafting/${essenceType}-essence.png`),
      10000
    );

    // Deposit lava runes
    const lavaRunePoint: Point = await centerOf(state.inventoryItemRegions[7]);
    await clickPoint({ point: lavaRunePoint });

    runCount++;

    console.log(`run count: ${runCount}`);

    if (runCount % 4 === 0) {
      await getNewRing();
    }

    if (runCount % 8 === 0) {
      await drinkEnergyPot();
    }

    if (
      (runCount - startingNecklaceChargeCount) % 16 === 0 ||
      runCount === startingNecklaceChargeCount
    ) {
      await getNewNecklace();
    }
  }
};

export const init = async () => {
  startingNecklaceChargeCount = await askNumber('What is your necklace charge count?');
  essenceType = await getEssenceType();

  runBot();
};
