import { screen } from '@nut-tree/nut-js';
import { magenta } from 'colorette';
import { getInventoryItemRegions, getPoint, getRegion } from '../utils';
import { ScriptInfo } from './types';

export const runSetup = (): Promise<ScriptInfo> => {
  return new Promise(async (resolve) => {
    console.log(magenta('select inventory'));
    const inventoryItemRegions = await getInventoryItemRegions();

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

    console.log(magenta('select east minimap'));
    const eastMinimapPoint = await getPoint();

    resolve({
      inventoryItemRegions,
      bankBoothImage,
      logsImage,
      closeBankPoint,
      startPoint1,
      startPoint2,
      eastMinimapPoint,
    });
  });
};
