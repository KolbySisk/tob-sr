import _ from 'lodash';
import iohook from 'iohook';
import { blue, red, yellow } from 'colorette';
import colorConvert from 'color-convert';
import delta from 'delta-e';

import {
  EasingFunction,
  mouse,
  Point,
  screen,
  straightTo,
  keyboard,
  Key,
  RGBA,
  Region,
  centerOf,
} from '@nut-tree/nut-js';

import { Keycode, Milliseconds, MouseEvent } from './types';

import '@nut-tree/template-matcher';

screen.config.resourceDirectory = 'resources';
screen.config.autoHighlight = true;
screen.config.confidence = 0.95;

export const sleep = (sleepDuration: Milliseconds) => {
  return new Promise((resolve) => {
    setTimeout(resolve, sleepDuration);
  });
};

export const randomSleep = async () => {
  let sleepTime = getFuzzyNumber(100, 50);

  // 20% chance of a short sleep
  if (_.random(10) >= 9) {
    console.log(blue('Short sleep triggered'));
    sleepTime = _.random(500, 3000);
  }

  // 2% chance of a long sleep
  if (_.random(100) >= 99) {
    console.log(blue('Long sleep triggered'));
    sleepTime = _.random(10000, 20000);
  }

  await sleep(sleepTime);
};

export const getFuzzyNumber = (number: number, bound: number) => {
  return _.random(number - bound, number + bound);
};

export const getFuzzyPoint = (point: Point): Point => {
  const fuzzyBounds = 5;

  return {
    x: getFuzzyNumber(point.x, fuzzyBounds),
    y: getFuzzyNumber(point.y, fuzzyBounds),
  };
};

const easeOut: EasingFunction = (x: number): number => {
  return 1 - Math.pow(1 - x, 5);
};

export const clickPoint = async ({
  point,
  speed = 1500,
  fuzzy,
  easingFunction = easeOut,
}: {
  point: Point;
  speed?: number;
  fuzzy?: boolean;
  easingFunction?: EasingFunction;
}) => {
  mouse.config.mouseSpeed = getFuzzyNumber(speed, 500); // Pixels per second
  const pointToClick = fuzzy ? getFuzzyPoint(point) : point;
  await mouse.move(straightTo(pointToClick), easingFunction);
  await mouse.leftClick();
};

export const pressKey = (keycode: Keycode) => {
  if (keycode === 27) keyboard.type(Key.Escape);
  else if (keycode === 32) keyboard.type(Key.Space);
  else if (keycode === 13) keyboard.type(Key.Enter);
};

export const rgbaToLab = (rgba: RGBA): { L: number; A: number; B: number } => {
  const result = colorConvert.rgb.lab([rgba.R, rgba.G, rgba.B]);
  return { L: result[0], A: result[1], B: result[2] };
};

export const getColorSimilarity = (rgba1: RGBA, rgba2: RGBA): number => {
  return delta.getDeltaE00(rgbaToLab(rgba1), rgbaToLab(rgba2));
};

export const colorCheck = async (point: Point, color: RGBA): Promise<boolean | void> => {
  const allowedFails = 10;
  let failCount = 0;

  const checkColors = async (point: Point, color: RGBA) => {
    const activeColor = await screen.colorAt(point);
    const colorSimilarity = getColorSimilarity(activeColor, color);

    console.log(colorSimilarity);

    const colorsMatch = colorSimilarity < 20;

    // colors are close enough, check passes
    if (colorsMatch) {
      return;
    }

    // check failed too many times, exit
    else if (failCount === allowedFails) {
      console.log(
        red(
          `color check failed, exiting. activeColor: ${activeColor}. color: ${color}. x: ${point.x}. y: ${point.y}`
        )
      );
      process.exit(1);
    }

    // check failed, try again
    else {
      failCount++;
      console.log(yellow(`color check fail: ${failCount}`));
      await sleep(1000);
      await checkColors(point, color);
    }
  };

  await checkColors(point, color);
};

export const getRegion = (): Promise<Region> => {
  return new Promise((resolve) => {
    let region: Region | undefined = undefined;
    let mouseDownPoint: Point | undefined = undefined;
    let mouseUpPoint: Point | undefined = undefined;

    const handleMouseDown = (event: MouseEvent) => {
      mouseDownPoint = {
        x: event.x,
        y: event.y,
      };
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (!mouseDownPoint) throw new Error('No mouse down, how did you do this?');

      mouseUpPoint = {
        x: event.x,
        y: event.y,
      };

      const left = mouseDownPoint.x < mouseUpPoint.x ? mouseDownPoint.x : mouseUpPoint.x;
      const top = mouseDownPoint.y < mouseUpPoint.y ? mouseDownPoint.y : mouseUpPoint.y;
      const width = Math.abs(mouseDownPoint.x - mouseUpPoint.x);
      const height = Math.abs(mouseDownPoint.y - mouseUpPoint.y);

      region = new Region(left, top, width, height);

      screen.highlight(region);

      iohook.off('mousedown', handleMouseDown);
      iohook.off('mouseup', handleMouseUp);

      resolve(region);
    };

    iohook.on('mousedown', handleMouseDown);
    iohook.on('mouseup', handleMouseUp);
    iohook.start();
  });
};

export const getInventoryItemRegions = async (): Promise<Region[]> => {
  const inventoryRegion = await getRegion();
  const inventoryItemRegions: Region[] = [];

  const inventoryItemWidth = inventoryRegion.width / 4;
  const inventoryItemHeight = inventoryRegion.height / 7;

  for (let x = 0; x < 4; x++) {
    for (let y = 0; y < 7; y++) {
      const left = inventoryRegion.left + x * inventoryItemWidth;
      const top = inventoryRegion.top + y * inventoryItemHeight;

      const inventoryItemRegion = new Region(left, top, inventoryItemWidth, inventoryItemHeight);
      inventoryItemRegions.push(inventoryItemRegion);
    }
  }

  return inventoryItemRegions;
};

export const dropInventory = async (inventoryItemRegions: Region[]) => {
  for (const inventoryItemRegion of inventoryItemRegions) {
    await clickPoint({
      point: await centerOf(inventoryItemRegion),
      speed: getFuzzyNumber(700, 100),
    });

    await sleep(getFuzzyNumber(200, 50));
  }
};
