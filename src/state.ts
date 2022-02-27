export class State {
  paused: boolean;

  constructor({ paused }: { paused: boolean }) {
    this.paused = paused;
  }

  getPaused() {
    return this.paused;
  }

  setPaused(paused: boolean) {
    this.paused = paused;
  }
}
