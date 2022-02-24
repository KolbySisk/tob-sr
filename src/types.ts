export type ActionClick = {
  actionType: 'click';
  data: { position: Position; color: Hex };
};

export type ActionKeypress = {
  actionType: 'keypress';
  data: Keycode;
};

export type Actions = (ActionClick | ActionKeypress)[];

export type Position = { x: number; y: number };

export type Keycode = number;

export type Milliseconds = number;

export type Lab = { L: number; A: number; B: number };
export type Rgb = number[];
export type Hex = string;
