import { Image, Point, Region } from '@nut-tree/nut-js';

export type ScriptInfo = {
  inventoryItemRegions: Region[];
  bankBoothImage: Image;
  logsImage: Image;
  closeBankPoint: Point;
  startPoint1: Point;
  startPoint2: Point;
  eastMinimapPoint: Point;
};
