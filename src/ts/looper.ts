export type LooperCallback = (
  timestampMs: DOMHighResTimeStamp,
  durationMs: number,
) => void;

export class Looper {
  protected callback: LooperCallback;

  protected shouldPlay: boolean;

  protected animationFrameId: ReturnType<typeof requestAnimationFrame>;

  protected lastTimestampMs: DOMHighResTimeStamp;

  protected internalTimestampMs: DOMHighResTimeStamp;

  constructor(callback: LooperCallback) {
    this.callback = callback;
    this.shouldPlay = false;
    this.animationFrameId = 0;
    this.lastTimestampMs = 0;
    this.internalTimestampMs = 0;
  }

  protected startAnimation(timestampMs: DOMHighResTimeStamp) {
    this.lastTimestampMs = timestampMs;
    this.animate(timestampMs);
  }

  protected animate(timestampMs: DOMHighResTimeStamp) {
    if (!this.shouldPlay) return;

    const durationMs = timestampMs - this.lastTimestampMs;
    this.internalTimestampMs += durationMs;

    this.callback(this.internalTimestampMs, durationMs);
    this.lastTimestampMs = timestampMs;

    if (this.shouldPlay) {
      this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    }
  }

  resume() {
    if (this.shouldPlay)
      // already playing
      return;

    this.shouldPlay = true;
    this.animationFrameId = requestAnimationFrame(
      this.startAnimation.bind(this),
    );
  }

  pause() {
    this.shouldPlay = false;

    if (this.animationFrameId === 0) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = 0;
    }
  }

  isPaused() {
    return !this.shouldPlay;
  }

  toggle() {
    if (this.isPaused()) {
      this.resume();
    } else {
      this.pause();
    }
  }
}
