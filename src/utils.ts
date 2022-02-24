import _ from 'lodash';
import iohook from 'iohook';
import robot, { Bitmap } from 'robotjs';
import delta from 'delta-e';
import colorConvert from 'color-convert';
import FastAverageColor from 'fast-average-color';
import jimp from 'jimp';

import { Actions, Hex, Keycode, Lab, Milliseconds, Position } from './types';
import { RGB } from 'color-convert/conversions';

const colorAverage = new FastAverageColor();

export const sleep = (sleepDuration: Milliseconds) => {
  return new Promise((resolve) => {
    setTimeout(resolve, sleepDuration);
  });
};

export const randomSleep = async () => {
  let sleepTime = 10;

  // 20% chance of a short sleep
  if (_.random(10) >= 9) {
    console.log('Short sleep triggered');
    sleepTime = _.random(500, 3000);
  }

  // 2% chance of a long sleep
  if (_.random(100) >= 99) {
    console.log('Long sleep triggered');
    sleepTime = _.random(10000, 20000);
  }

  await sleep(sleepTime);
};

export const getFuzzyNumber = (number: number, bound: number) => {
  return _.random(number - bound, number + bound);
};

export const pressKey = (keycode: Keycode) => {
  if (keycode === 27) robot.keyTap('escape');
  else if (keycode === 32) robot.keyTap('space');
  else if (keycode === 13) robot.keyTap('enter');
};

export const runSetup = async (): Promise<Actions> => {
  return new Promise((resolve) => {
    let actions: Actions = [];

    const handleClick = () => {
      const position = robot.getMousePos();
      const color = getColorAtPosition(position);

      actions.push({ actionType: 'click', data: { position, color } });
      console.error('click to add a position, or type to add a keypress. Press tab when ready');
    };

    const handleKeyPress = (key: any) => {
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

    console.log('click first position');

    iohook.on('mouseclick', handleClick);
    iohook.on('keypress', handleKeyPress);
    iohook.start();
  });
};

export const getColorAtPosition = (position: Position, screenImage?: Bitmap): Hex => {
  const capture = screenImage ?? getScreenImage();

  const jimpImage = new jimp({
    data: capture.image,
    width: capture.width,
    height: capture.height,
  });

  const jimpColor = jimp.intToRGBA(jimpImage.getPixelColor(position.x, position.y));

  const hex = colorConvert.rgb.hex([jimpColor.r, jimpColor.g, jimpColor.b]);

  return hex;
};

export const hexToLab = (hex: Hex): Lab => {
  var result = colorConvert.hex.lab(hex);
  return { L: result[0], A: result[1], B: result[2] };
};

export const getColorSimilarity = (hexA: Hex, hexB: Hex) => {
  const labA = hexToLab(hexA);
  const labB = hexToLab(hexB);

  return delta.getDeltaE00(labA, labB);
};

export const getScreenImage = () => {
  const screenSize = robot.getScreenSize();
  const screenImage = robot.screen.capture(0, 0, screenSize.width, screenSize.height);

  // fixes something, maybe? https://github.com/octalmage/robotjs/issues/545
  for (var i = 0; i < screenImage.image.length; i += 4) {
    let r = screenImage.image[i];
    let b = screenImage.image[i + 2];
    screenImage.image[i] = b;
    screenImage.image[i + 2] = r;
    screenImage.image[i + 3] = 255;
  }

  return screenImage;
};

export const getColorsAtPosition = (position: Position): Hex[] => {
  const { x, y } = position;
  const bigX = position.x + 1;
  const bigY = position.y + 1;
  const smallX = position.x - 1;
  const smallY = position.y - 1;

  const positions: Position[] = [
    {
      ...position,
    },
    { x: bigX, y },
    { x: smallX, y },
    { x, y: bigY },
    { x, y: smallY },
    { x: bigX, y: bigY },
    { x: smallX, y: smallY },
    { x: bigX, y: smallY },
    { x: smallX, y: bigY },
  ];

  const screenImage = getScreenImage();

  const colors: Hex[] = positions.map((position) => {
    return getColorAtPosition(position, screenImage);
  });

  return colors;
};

export const getAverageColorAtPosition = (position: Position): Hex => {
  const colorsAtPosition = getColorsAtPosition(position);
  const colors = colorsAtPosition.map((hex) => {
    const rgb = colorConvert.hex.rgb(hex);
    const rgba = [...rgb, 255];
    return rgba;
  });

  const averageRgb = colorAverage.getColorFromArray4(colors.flat());
  return colorConvert.rgb.hex(averageRgb as unknown as RGB);
};

let imageNumber = 1;

export const saveScreenImage = async (screenImage?: Bitmap) => {
  const swapRedAndBlueChannel = (screenImage: Bitmap) => {
    for (let i = 0; i < screenImage.width * screenImage.height * 4; i += 4) {
      [screenImage.image[i], screenImage.image[i + 2]] = [
        screenImage.image[i + 2],
        screenImage.image[i],
      ];
    }
    return screenImage;
  };

  const robotImage = screenImage
    ? swapRedAndBlueChannel(screenImage)
    : swapRedAndBlueChannel(robot.screen.capture());

  const jimpImage = new jimp({
    data: robotImage.image,
    width: robotImage.width,
    height: robotImage.height,
  });

  await jimpImage.writeAsync(`${imageNumber}.png`);

  imageNumber++;
};

export const colorCheck = async (position: Position, color: Hex): Promise<boolean | void> => {
  const allowedFails = 10;
  let failCount = 0;

  const checkColors = async (position: Position, color: Hex) => {
    const activeColor = getColorAtPosition(position);
    const colorSimilarity = getColorSimilarity(activeColor, color);
    const colorsMatch = colorSimilarity < 20;

    // colors are close enough, check passes
    if (colorsMatch) {
      return;
    }

    // check failed too many times, exit
    else if (failCount === allowedFails) {
      console.log('color check failed, exiting');
      await saveScreenImage();
      process.exit(1);
    }

    // check failed, try again
    else {
      failCount++;
      console.log(`color check fail: ${failCount}`);
      await sleep(1000);
      await checkColors(position, color);
    }
  };

  await checkColors(position, color);
};
