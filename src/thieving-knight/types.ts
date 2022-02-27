import { Point, Region } from '@nut-tree/nut-js';

export type ScriptInfo = {
  inventoryItemRegions: Region[];
  healthRegion: Region;
  knightPoint: Point;
  bankPoint: Point;
  foodPoint: Point;
  standPoint: Point;
};
