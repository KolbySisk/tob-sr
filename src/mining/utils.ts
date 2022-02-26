import { blue, magenta } from 'colorette';
import { screen } from '@nut-tree/nut-js';
import { getInventoryItemRegions, getRegion } from '../utils';
import { ScriptInfo } from './types';

export const runSetup = (): Promise<ScriptInfo> => {
  return new Promise(async (resolve) => {
    const scriptInfo: any = {};

    console.log(blue('Make sure your inventory is empty and click-to-drop is on.'));

    console.log(magenta('select inventory'));
    scriptInfo.inventoryItemRegions = await getInventoryItemRegions();
    scriptInfo.lastInventoryItemImage = await screen.grabRegion(
      scriptInfo.inventoryItemRegions[26]
    );

    console.log(magenta('select ore1'));
    const ore1Region = await getRegion();
    scriptInfo.ore1Image = await screen.grabRegion(ore1Region);

    console.log(magenta('select ore2'));
    const ore2Region = await getRegion();
    scriptInfo.ore2Image = await screen.grabRegion(ore2Region);

    console.log(magenta('select ore3'));
    const ore3Region = await getRegion();
    scriptInfo.ore3Image = await screen.grabRegion(ore3Region);

    console.log(magenta('select region to watch'));
    scriptInfo.watchRegion = await getRegion();

    resolve(scriptInfo);
  });
};
