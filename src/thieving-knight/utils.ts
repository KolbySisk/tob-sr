import { blue, magenta } from 'colorette';
import { getInventoryItemRegions, getPoint, getRegion } from '../utils';
import { ScriptInfo } from './types';

export const runSetup = (): Promise<ScriptInfo> => {
  return new Promise(async (resolve) => {
    const scriptInfo: any = {};

    console.log(
      blue(
        'Make sure to stand at thieving spot, coins in inv1, empty inv2, food in rest, bank is ready to grab food.'
      )
    );

    console.log(magenta('Select inventory'));
    const inventoryItemRegions = await getInventoryItemRegions();

    console.log(magenta('Select health'));
    const healthRegion = await getRegion();

    console.log(magenta('Click knight'));
    const knightPoint = await getPoint();

    console.log(magenta('Click bank'));
    const bankPoint = await getPoint();
    scriptInfo.bankPoint = bankPoint;

    console.log(magenta('Click food'));
    const foodPoint = await getPoint();
    scriptInfo.foodPoint = foodPoint;

    console.log(magenta('Click thieving spot'));
    const standPoint = await getPoint();
    scriptInfo.standPoint = standPoint;

    resolve({
      inventoryItemRegions,
      healthRegion,
      knightPoint,
      bankPoint,
      foodPoint,
      standPoint,
    });
  });
};
