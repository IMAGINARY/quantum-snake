import Directions from './directions.js';

const MIN_LENGTH = 2;

export class Snake {
  constructor(game) {
    this.game = game;

    this.body = [{ x: 0, y: 10 }];
    this.maxLength = MIN_LENGTH;
    this.maxLength = 10;
    this.dead = false;
  }

  move(direction) {
    const { boardWidth, boardHeight } = this.game.config;

    const head = this.body[this.body.length - 1];
    const newHead = { ...head };

    switch (direction) {
      case Directions.UP:
        newHead.y -= 1;
        break;
      case Directions.DOWN:
        newHead.y += 1;
        break;
      case Directions.LEFT:
        newHead.x -= 1;
        break;
      case Directions.RIGHT:
        newHead.x += 1;
        break;
    }

    newHead.x = (boardWidth + newHead.x) % boardWidth;
    newHead.y = (boardHeight + newHead.y) % boardHeight;

    this.body.push(newHead);
    this.truncate();
  }

  truncate() {
    if (this.body.length > this.maxLength) {
      const start = this.body.length - this.maxLength;
      const end = this.body.length;
      this.body = this.body.slice(start, end);
    }
  }

  grow(offset) {
    this.maxLength += offset;
  }

  shrink(offset) {
    this.maxLength = Math.max(this.maxLength - offset, MIN_LENGTH);
    this.truncate();
  }
}

export default Snake;
