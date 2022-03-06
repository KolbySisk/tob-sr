import { Image, Region, screen, sleep } from '@nut-tree/nut-js';
import { magenta, red } from 'colorette';
import { getPoint, getRegion, walkRight } from '../utils';
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

    console.log(magenta('click east minimap'));
    const eastMinimapPoint = await getPoint();

    resolve({
      bankBoothImage,
      logsImage,
      closeBankPoint,
      startPoint1,
      startPoint2,
      eastMinimapPoint,
    });
  });
};

export const findBankBoothRegion = async (
  bankBoothImage: Image,
  retryCount: number = 0
): Promise<Region> => {
  return new Promise(async (resolve) => {
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
      await walkRight();
      await sleep(500);
      const bankRegion = await screen.find(bankBoothImage);
      resolve(bankRegion);
    } catch (error) {
      retry(`${error}`);
    }
  });
};
