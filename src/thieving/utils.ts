import { Point } from '@nut-tree/nut-js';
import { magenta } from 'colorette';
import { getPoint } from '../utils';

export const getKnightPoint = (): Promise<Point> => {
  return new Promise(async (resolve) => {
    console.log(magenta('click knight'));
    const knightPoint = await getPoint();

    resolve(knightPoint);
  });
};
