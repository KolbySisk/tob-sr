import { Milliseconds } from '../types';

export type TrainingMethod = { waitDuration: Milliseconds };

export type TrainingMethods = {
  [key: string]: TrainingMethod;
};
