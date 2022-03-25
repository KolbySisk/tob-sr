import { Image, imageResource, Point, Region, screen } from '@nut-tree/nut-js';
import { magenta, red } from 'colorette';
import {
  clickPoint,
  getPoint,
  getRegion,
  inventoryItemRegionHasItem,
  waitUntilStationaryImageFound,
} from '../utils';
import { ScriptInfo } from './types';

export const runSetup = (): Promise<ScriptInfo> => {
  return new Promise(async (resolve) => {
    console.log(magenta('select bank booth'));
    const bankBoothRegion = await getRegion();
    const bankBoothImage = await screen.grabRegion(bankBoothRegion);

    console.log(magenta('click bank booth'));
    await getPoint();

    console.log(magenta('select logs'));
    const logsRegion = await getRegion();
    const logsImage = await screen.grabRegion(logsRegion);

    console.log(magenta('click on logs'));
    await getPoint();

    console.log(magenta('click close bank'));
    const closeBankPoint = await getPoint();

    console.log(magenta('select starting spot 1'));
    const startPoint1 = await getPoint();

    console.log(magenta('select starting spot 2'));
    const startPoint2 = await getPoint();

    resolve({
      bankBoothImage,
      logsImage,
      closeBankPoint,
      startPoint1,
      startPoint2,
    });
  });
};

export const findBankBoothRegion = async (
  bankBoothImage: Image,
  retryCount: number = 0
): Promise<Region> => {
  return new Promise(async (resolve, reject) => {
    const retry = async (error: string) => {
      console.log(`retrying find bank: ${retryCount}`);
      console.log(error);
      if (retryCount === 7) {
        console.log(red('Find bank reached fail limit. Time to bail'));
        process.exit(1);
      }
      resolve(await findBankBoothRegion(bankBoothImage, retryCount + 1));
    };

    try {
      const boothRegion = await waitUntilStationaryImageFound(
        await imageResource(`fire-making/booth.png`),
        5000
      );
      if (!boothRegion) throw new Error('boothRegion not found');

      const x = boothRegion.left + boothRegion.width - 2;
      const y = boothRegion.top + boothRegion.height + 5;
      await clickPoint({ point: new Point(x, y) });

      const bankRegion = await waitUntilStationaryImageFound(bankBoothImage, 5000);
      if (!bankRegion) throw new Error('bankRegion not found');

      resolve(bankRegion);
    } catch (error) {
      retry(`${error}`);
      reject(error);
    }
  });
};

export const checkLogsAreBurning = async (
  inventoryItemRegions: Region[],
  logsBurnedCount: number
) => {
  let failCount = 0;

  if (await inventoryItemRegionHasItem(inventoryItemRegions[logsBurnedCount])) failCount++;
  if (await inventoryItemRegionHasItem(inventoryItemRegions[logsBurnedCount - 1])) failCount++;
  if (await inventoryItemRegionHasItem(inventoryItemRegions[logsBurnedCount - 2])) failCount++;

  if (failCount == 3) throw new Error(`Log didn't burn`);
};
