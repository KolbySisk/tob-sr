import _ from 'lodash';
import iohook from 'iohook';
import { blue, magenta, red, yellow } from 'colorette';
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
  imageResource,
} from '@nut-tree/nut-js';

import { Actions, Keycode, Milliseconds } from './types';

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
  let sleepTime = 10;

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

export const runSetup = async (): Promise<Actions> => {
  return new Promise((resolve) => {
    let actions: Actions = [];

    const handleClick = async () => {
      const point = await mouse.getPosition();
      const color = await screen.colorAt(point);

      actions.push({ actionType: 'click', data: { point, color } });

      console.log(magenta('click to add a point, or type to add a keypress. Press tab when ready'));
    };

    const handleKeyPress = (key: { rawcode: number }) => {
      // Exit when backtick is pressed
      if (key.rawcode === 192) {
        process.exit(1);
      }

      // Finish setup when tab is pressed
      else if (key.rawcode === 9) {
        iohook.off('mouseclick', handleClick);
        resolve(actions);
      }

      // Push pressed key into actions
      else {
        actions.push({ actionType: 'keypress', data: key.rawcode });
      }
    };

    console.log(magenta('click first position'));

    iohook.on('mouseclick', handleClick);
    iohook.on('keypress', handleKeyPress);
    iohook.start();
  });
};

export const getFuzzyNumber = (number: number, bound: number) => {
  return _.random(number - bound, number + bound);
};

export const getFuzzyPoint = (point: Point): Point => {
  const fuzzyBounds = 10;

  return {
    x: getFuzzyNumber(point.x - fuzzyBounds, point.x + fuzzyBounds),
    y: getFuzzyNumber(point.y - fuzzyBounds, point.y + fuzzyBounds),
  };
};

const easeOut: EasingFunction = (x: number): number => {
  return Math.sqrt(1 - Math.pow(x - 1, 2));
};

export const clickPoint = async ({ point, fuzzy }: { point: Point; fuzzy?: boolean }) => {
  mouse.config.mouseSpeed = getFuzzyNumber(1500, 500); // Pixels per second
  const pointToClick = fuzzy ? getFuzzyPoint(point) : point;
  await mouse.move(straightTo(pointToClick), easeOut);
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

    const colorsMatch = colorSimilarity < 15;

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
      //await saveScreenImage();
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
