import _ from 'lodash';
import iohook from 'iohook';
import robot from 'robotjs';

import { Milliseconds, Position } from './types';

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

export const runSetup = async (): Promise<Position[]> => {
  return new Promise((resolve) => {
    let positions: Position[] = [];

    const registerPositionOnClick = () => {
      positions.push(robot.getMousePos());
      console.log('click next position, or press enter when ready');
    };

    console.log('click first position');

    iohook.on('mouseclick', registerPositionOnClick);

    iohook.on('keypress', (key: any) => {
      // Exit when backtick is pressed
      if (key.rawcode === 192) process.exit(1);

      // Finish setup when enter is pressed
      if (key.rawcode === 13) {
        iohook.off('mouseclick', registerPositionOnClick);
        resolve(positions);
      }
    });

    iohook.start();
  });
};
