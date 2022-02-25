import { Point, RGBA } from '@nut-tree/nut-js';

export type Milliseconds = number;

export type Actions = (ActionClick | ActionKeypress)[];

export type ActionClick = {
  actionType: 'click';
  data: { point: Point; color: RGBA };
};

export type ActionKeypress = {
  actionType: 'keypress';
  data: Keycode;
};

export type Keycode = number;

export type TrainingMethod = { waitDuration: Milliseconds };

export type TrainingMethods = {
  [key: string]: TrainingMethod;
};

export type MouseEvent = {
  button: number;
  clicks: number;
  x: number;
  y: number;
  type: 'mousedown' | 'mouseup';
};
