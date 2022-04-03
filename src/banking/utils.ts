import { mouse, screen } from '@nut-tree/nut-js';
import { magenta } from 'colorette';
import inquirer from 'inquirer';
import iohook from 'iohook';
import { Actions } from '../types';
import { TrainingMethods, TrainingMethod } from './types';

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
      // Finish setup when tab is pressed
      if (key.rawcode === 9) {
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

export const trainingMethods: TrainingMethods = {
  'Amethyst arrowtips': {
    waitDuration: 33000,
    sleepsCommon: true,
    colorCheck: true,
  },
  Dhide: {
    waitDuration: 15000,
    sleepsCommon: true,
    colorCheck: true,
  },
  BroadBolts: {
    waitDuration: 0,
    sleepsCommon: false,
    colorCheck: false,
  },
  Glass: {
    waitDuration: 3000,
    sleepsCommon: true,
    colorCheck: false,
  },
};

export const getTrainingMethod = async (): Promise<TrainingMethod> => {
  const response = await inquirer.prompt([
    {
      type: 'list',
      name: 'method',
      message: 'Select a training method',
      choices: Object.keys(trainingMethods),
    },
  ]);

  return trainingMethods[response.method];
};
