import {
  centerOf,
  imageResource,
  Key,
  keyboard,
  Point,
  randomPointIn,
  sleep,
} from '@nut-tree/nut-js';
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
    await clickJewelryBox();

    // Teleport to Duel Arena
    await teleportToDuelArena();

    await randomSleep();

    // Go to ruins
    await clickCactusOnMiniMap();

    // Click ruins
    const ruinsFound = await findAndClickRuins();

    // If ruins can't be found we bail and try again
    if (!ruinsFound) {
      continue;
    }

    // Wait until end of ruins teleport
    //await sleep(3000);
    const treeFound = await waitUntilStationaryImageFound(
      await imageResource(`rune-crafting/tree.png`),
      5000
    );
    if (!treeFound) continue;

    await randomSleep();

    // Go to alter
    console.log('clicking minimap');
    await clickMinimap(getFuzzyNumber(71, 2), getFuzzyNumber(71, 2));

    // Cast imbue
    await castImbue();

    // Use earth rune on alter
    const alterFound = await useEarthRunesOnAlter(state.inventoryItemRegions[0]);
    if (!alterFound) continue;

    // Teleport to house
    await teleportToHouse(state.inventoryItemRegions[2]);

    if (runCount % 12 === 0) {
      await clickPool();
      await sleep(3000);
      await clickPoint({ point: new Point(1240, 640), fuzzy: true });
      await sleep(3000);
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
    await findAndClickImage(`rune-crafting/${essenceType}-essence.png`, 2);
    await sleep(getSmartFuzzyNumber(1500));

    // Close bank
    console.log('closing bank');
    await clickPoint({ point: new Point(1291, 368), fuzzy: true });
    await sleep(getSmartFuzzyNumber(500));
  }
};

export const init = async () => {
  startingNecklaceChargeCount = await askNumber('What is your necklace charge count?');
  essenceType = await getEssenceType();

  runBot();
};
