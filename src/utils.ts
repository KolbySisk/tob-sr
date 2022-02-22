import _ from 'lodash';
import iohook from 'iohook';
import robot from 'robotjs';

import { Actions, Keycode, Milliseconds, Position, RGB } from './types';

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

export const getColorAtPosition = (position: Position): RGB => {
  const screenSize = robot.getScreenSize();
  const img = robot.screen.capture(0, 0, screenSize.width, screenSize.height);
  const hex = img.colorAt(position.x, position.y);
  return hexToRgb(`#${hex}`);
};

export const hexToRgb = (hex: string): number[] => {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return [parseInt(result![1], 16), parseInt(result![2], 16), parseInt(result![3], 16)];
};

export function getColorSimilarity(rgbA: RGB, rgbB: RGB) {
  function rgb2lab(rgb: number[]) {
    let r = rgb[0] / 255,
      g = rgb[1] / 255,
      b = rgb[2] / 255,
      x,
      y,
      z;
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
    x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
    y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.0;
    z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
    x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
    y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
    z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;
    return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
  }
  let labA = rgb2lab(rgbA);
  let labB = rgb2lab(rgbB);
  let deltaL = labA[0] - labB[0];
  let deltaA = labA[1] - labB[1];
  let deltaB = labA[2] - labB[2];
  let c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2]);
  let c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2]);
  let deltaC = c1 - c2;
  let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
  deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
  let sc = 1.0 + 0.045 * c1;
  let sh = 1.0 + 0.015 * c1;
  let deltaLKlsl = deltaL / 1.0;
  let deltaCkcsc = deltaC / sc;
  let deltaHkhsh = deltaH / sh;
  let i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
  return i < 0 ? 0 : Math.sqrt(i);
}
