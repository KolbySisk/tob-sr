import { Region } from '@nut-tree/nut-js';

export class State {
  paused: boolean;
  activeWindowRegion: Region | undefined;
  inventoryRegion: Region | undefined;
  inventoryItemRegions: Region[] | undefined;
  minimapRegion: Region | undefined;

  constructor({ paused }: { paused: boolean }) {
    this.paused = paused;
  }
}
