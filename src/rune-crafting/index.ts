import { centerOf, imageResource, Point, randomPointIn, sleep } from '@nut-tree/nut-js';
import {
  askNumber,
  clickMinimap,
  clickPoint,
  findAndClickImage,
  getFuzzyNumber,
  getSmartFuzzyNumber,
  randomSleep,
  waitUntilImageFound,
  waitUntilStationaryImageFound,
} from '../utils';

import {
  findAndClickRuins,
  getNewNecklace,
  getEssenceType,
  clickCactusOnMiniMap,
  clickJewelryBox,
  openBank,
  clickPool,
  teleportToHouse,
  teleportToDuelArena,
  castImbue,
  useEarthRunesOnAlter,
  closeBank,
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

    // Teleport to house
    await teleportToHouse(state.inventoryItemRegions[2]);

    // Click jewelry box
    const jewelryBoxClicked = await clickJewelryBox();
    if (!jewelryBoxClicked) process.exit(1);

    // Teleport to Duel Arena
    await teleportToDuelArena();

    await randomSleep();

    // Go to ruins
    await clickCactusOnMiniMap();

    // Click ruins
    const ruinsFound = await findAndClickRuins();

    // If ruins can't be found we bail and try again
    if (!ruinsFound) continue;

    // Wait until end of ruins teleport
    const alterFound = await waitUntilStationaryImageFound(
      await imageResource(`rune-crafting/alter.png`),
      5000
    );
    if (!alterFound) continue;

    await randomSleep();

    // Cast imbue
    await castImbue();

    const craftSuccessful = await useEarthRunesOnAlter(state.inventoryItemRegions[0]);
    if (!craftSuccessful) continue;

    // Teleport to house
    await teleportToHouse(state.inventoryItemRegions[2]);

    if (runCount % 12 === 0) {
      await clickPool();
      await sleep(getSmartFuzzyNumber(2000));
    }

    // Click jewelry box
    await clickJewelryBox();

    // Teleport to Castle Wars
    console.log('teleporting to castle wars');
    const castleWarsOptionRegion = await waitUntilImageFound(
      await imageResource(`rune-crafting/castle-wars.png`),
      20000,
      0.94
    );
    if (!castleWarsOptionRegion) throw new Error('castleWarsOptionRegion not found');

    console.log('castle wars option found');
    await clickPoint({ point: await centerOf(castleWarsOptionRegion), fuzzy: true });

    await randomSleep();

    // Go towards bank
    const bankIconRegion = await waitUntilImageFound(
      await imageResource(`rune-crafting/bank-icon.png`),
      10000,
      0.94
    );
    if (!bankIconRegion) throw new Error('bankIconRegion not found');
    await clickPoint({ point: await centerOf(bankIconRegion) });

    // Open bank
    await openBank();

    // Deposit lava runes
    console.log('depositing lava runes');
    await clickPoint({ point: await randomPointIn(state.inventoryItemRegions[7]) });
    await sleep(400);

    runCount++;

    console.log(`run count: ${runCount}`);

    if (
      (runCount - startingNecklaceChargeCount) % 16 === 0 ||
      runCount === startingNecklaceChargeCount
    ) {
      await getNewNecklace();
    }

    // Get essence from bank
    console.log('getting more essence');
    await findAndClickImage(`rune-crafting/${essenceType}-essence.png`, 20);
    await sleep(getSmartFuzzyNumber(1500));

    // Close bank
    await closeBank();
  }
};

export const init = async () => {
  startingNecklaceChargeCount = await askNumber('What is your necklace charge count?');
  essenceType = await getEssenceType();

  runBot();
};
