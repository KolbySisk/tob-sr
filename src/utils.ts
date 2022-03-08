import _ from 'lodash';
import iohook from 'iohook';
import { blue, red, yellow } from 'colorette';
import colorConvert from 'color-convert';
import delta from 'delta-e';
import getPixels from 'get-pixels';
import fs from 'fs';
import { createWorker, PSM } from 'tesseract.js';
import sharp from 'sharp';

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
  sleep,
  Image,
  OptionalSearchParameters,
} from '@nut-tree/nut-js';

import { state } from './';

import { Keycode, MouseEvent } from './types';

import '@nut-tree/template-matcher';

screen.config.resourceDirectory = 'resources';
screen.config.autoHighlight = true;
screen.config.confidence = 0.95;

export const pause = async () => {
  await sleep(1000);
  if (state.paused) await pause();
};

export const initControls = () => {
  iohook.on('keypress', (key: { rawcode: number }) => {
    // Exit when backtick is pressed
    if (key.rawcode === 192) {
      process.exit();
    }

    // Pause/Resume when p is pressed
    else if (key.rawcode === 80) {
      console.log(state.paused ? 'resuming' : 'pausing');
      state.paused = !state.paused;
    }
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

export const getFuzzyPoint = (point: Point, bounds = 5): Point => {
  return {
    x: getFuzzyNumber(point.x, bounds),
    y: getFuzzyNumber(point.y, bounds),
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

export const getPoint = (): Promise<Point> => {
  return new Promise((resolve) => {
    const handleMouseClick = (event: MouseEvent) => {
      const point = new Point(event.x, event.y);

      iohook.off('mouseclick', handleMouseClick);

      resolve(point);
    };

    iohook.on('mouseclick', handleMouseClick);
    iohook.start();
  });
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

export const dropInventory = async (inventoryItemRegions: Region[]) => {
  for (const inventoryItemRegion of inventoryItemRegions) {
    await clickPoint({
      point: await centerOf(inventoryItemRegion),
      speed: getFuzzyNumber(700, 100),
    });

    await sleep(getFuzzyNumber(200, 50));
  }
};

export const inventoryItemRegionHasItem = async (
  inventoryItemRegion: Region,
  retryCount: number = 0
): Promise<boolean> => {
  return new Promise(async (resolve) => {
    const retry = async (error: string) => {
      console.log(`retrying inventory item check: ${retryCount}`);
      console.log(error);
      if (retryCount === 5) {
        console.log(red('Inventory item check reached fail limit. Time to bail'));
        process.exit(1);
      }
      resolve(await inventoryItemRegionHasItem(inventoryItemRegion, retryCount + 1));
    };

    try {
      const borderColor = new RGBA(11, 7, 8, 255);
      await screen.captureRegion('temp-inv', inventoryItemRegion); // refactor to use buffer
      // const screenCapture = await screen.grabRegion(region);

      getPixels('./temp-inv.png', async (error, pixels) => {
        if (error) retry(`${error}`);

        // loop over every pixel
        for (let x = 0; x < pixels.shape[0]; x++) {
          for (let y = 0; y < pixels.shape[1]; y++) {
            // Create RGBA for current pixel
            const colorAtPoint = new RGBA(
              pixels.get(x, y, 0),
              pixels.get(x, y, 1),
              pixels.get(x, y, 2),
              255
            );

            const colorSimilarity = getColorSimilarity(colorAtPoint, borderColor);

            // this pixel is similar enough to the border color, assume there is an item and return true
            if (colorSimilarity < 4) {
              resolve(true);
            }
          }
        }

        // None of the pixels were similar enough to the border color, assume there is no item and return false
        fs.unlink('./temp-inv.png', () => {
          resolve(false);
        });
      });
    } catch (error) {
      retry(`${error}`);
    }
  });
};

export const getInventory = async (inventoryItemRegions: Region[]): Promise<boolean[]> => {
  const inventory: boolean[] = [];

  for (const inventoryItemRegion of inventoryItemRegions) {
    inventory.push(await inventoryItemRegionHasItem(inventoryItemRegion));
  }

  return inventory;
};

export const getNumberFromRegion = async (
  region: Region,
  retryCount: number = 0
): Promise<number> => {
  return new Promise(async (resolve) => {
    const retry = async (error: string) => {
      console.log(`retrying number check: ${retryCount}`);
      console.log(error);
      if (retryCount === 5) {
        console.log(red('Number check reached fail limit. Time to bail'));
        process.exit(1);
      }
      resolve(await getNumberFromRegion(region, retryCount + 1));
    };

    try {
      await screen.captureRegion('temp-number', region); // refactor to use buffer
      sharp.cache(false);
      await sharp('./temp-number.png')
        .extractChannel('green')
        .negate()
        .toFile('temp-number-modified.png');

      const worker = createWorker();
      await worker.load();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789',
        user_defined_dpi: '70',
      });

      const {
        data: { text },
      } = await worker.recognize('./temp-number-modified.png');

      await worker.terminate();

      //fs.unlink('./temp-number-modified.png', () => {
      // fs.unlink('./temp-number.png', () => {
      resolve(parseInt(text));
      // });
      // });
    } catch (error) {
      retry(`${error}`);
    }
  });
};

export const walkRight = async () => {
  if (!state.activeWindowRegion) throw new Error('state.activeWindowRegion not found');

  const point = new Point(
    state.activeWindowRegion.width / 2 +
      state.activeWindowRegion.width * 0.18 +
      state.activeWindowRegion.left,
    state.activeWindowRegion.height / 2 + state.activeWindowRegion.top + 25
  );

  await clickPoint({ point });

  await sleep(2100);
};

export const findImageRegion = async (
  image: Image,
  retryCount: number = 0
): Promise<Region | false> => {
  const searchOptions = new OptionalSearchParameters(state.activeWindowRegion, 0.95);

  return new Promise(async (resolve) => {
    const retry = async (error: string) => {
      console.log(`retrying find image: ${retryCount}`);
      console.log(error);
      if (retryCount === 7) {
        resolve(false);
        return;
      }
      resolve(await findImageRegion(image, retryCount + 1));
      return;
    };

    try {
      const imageRegion = await screen.find(image, searchOptions);
      resolve(imageRegion);
    } catch (error) {
      retry(`${error}`);
    }
  });
};

export const clickMinimap = async (leftPercent: number, topPercent: number) => {
  if (!state.minimapRegion) throw new Error('state.minimapRegion not found');

  const x = state.minimapRegion.left + state.minimapRegion.width * (leftPercent / 100);
  const y = state.minimapRegion.top + state.minimapRegion.height * (topPercent / 100);
  const point = new Point(x, y);
  await clickPoint({ point, fuzzy: false });
};
