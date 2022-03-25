import { Milliseconds } from '../types';

export type TrainingMethod = {
  waitDuration: Milliseconds;
  sleepsCommon: boolean;
  colorCheck: boolean;
};

export type TrainingMethods = {
  [key: string]: TrainingMethod;
};
