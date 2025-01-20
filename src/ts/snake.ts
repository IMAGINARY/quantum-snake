import { exhaustiveGuard } from './type-helpers';
import { Directions } from './directions';
import type { IGame } from './igame';
import type { Point2 } from './point-2';

const MIN_LENGTH = 2;

export class Snake {
  protected game: IGame;

  // TODO: Make protected
  public body: Point2[];

  protected maxLength: number;

  dead: boolean;

  constructor(game: IGame) {
    this.game = game;

    this.body = [{ x: 0, y: 10 }];
    this.maxLength = MIN_LENGTH;
    this.dead = false;
  }

  move(direction: keyof typeof Directions) {
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
      default:
        exhaustiveGuard(direction);
    }

    newHead.x = (boardWidth + newHead.x) % boardWidth;
    newHead.y = (boardHeight + newHead.y) % boardHeight;

    this.body.push(newHead);
    this.truncate();
  }

  protected truncate() {
    if (this.body.length > this.maxLength) {
      const start = this.body.length - this.maxLength;
      const end = this.body.length;
      this.body = this.body.slice(start, end);
    }
  }

  grow(offset: number) {
    // TODO: offset must be positive integer
    this.maxLength += offset;
  }

  shrink(offset: number) {
    // TODO: offset must be positive integer
    this.maxLength = Math.max(this.maxLength - offset, MIN_LENGTH);
    this.truncate();
  }
}
