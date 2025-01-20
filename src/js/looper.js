export class Looper {
  constructor(callback) {
    this.callback = callback;
    this.shouldPlay = false;
    this.animationFrameId = 0;
    this.lastTimestampMs = 0;
    this.internalTimestampMs = 0;
  }

  startAnimation(timestampMs) {
    this.lastTimestampMs = timestampMs;
    this.animate(timestampMs);
  }

  animate(timestampMs) {
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

export default Looper;
