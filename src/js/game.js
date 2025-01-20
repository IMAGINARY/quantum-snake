import Snake from './snake.js';
import ItemManager from './item-manager.js';
import Renderer from './renderer';
import Directions from './directions.js';
import Looper from './looper';

export class Game {
  constructor(canvasElement, statusElement, config) {
    this.statusElement = statusElement;

    this.config = config;

    const { boardWidth, boardHeight, blockSize } = this.config;

    this.canvasElement = canvasElement;
    this.canvasElement.width = boardWidth * blockSize;
    this.canvasElement.height = boardHeight * blockSize;

    this.ctx = canvasElement.getContext('2d');
    this.durationSinceLastStepMs = 0;

    this.blocksPerSecond = 10;

    this.direction = Directions.RIGHT;
    this.directionCandidate = this.direction;

    this.snake = new Snake(this);
    this.itemManager = new ItemManager(this);
    this.renderer = new Renderer(this);

    this.looper = new Looper(this.iterate.bind(this));

    const keyDirectionMap = {
      ArrowUp: Directions.UP,
      ArrowDown: Directions.DOWN,
      ArrowLeft: Directions.LEFT,
      ArrowRight: Directions.RIGHT,
    };

    const keySpeedMap = {
      '+': +1,
      '-': -1,
    };

    document.addEventListener('keydown', (event) => {
      this.directionCandidate =
        keyDirectionMap[event.key] ?? this.directionCandidate;

      this.blocksPerSecond = Math.max(
        1,
        this.blocksPerSecond + (keySpeedMap[event.key] ?? 0),
      );
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === ' ') this.looper.toggle();
    });
  }

  start() {
    this.looper.resume();
  }

  iterate(timestampMs, durationMs) {
    this.updateState(durationMs);
    this.renderer.render();
  }

  updateState(durationMs) {
    this.durationSinceLastStepMs += durationMs;
    if (this.durationSinceLastStepMs >= 1000 / this.blocksPerSecond) {
      this.updateDirection();
      let steps = Math.floor(
        this.durationSinceLastStepMs / (1000 / this.blocksPerSecond),
      );
      while (steps > 0) {
        // Move snake
        this.snake.move(this.direction);
        this.durationSinceLastStepMs -= 1000 / this.blocksPerSecond;
        steps -= 1;

        // Handle collision of the snake with itself
        const selfCollisionIndex = this.collide(
          this.snake.body,
          this.snake.body[this.snake.body.length - 1],
        );
        if (selfCollisionIndex === this.snake.body.length - 1) {
          // Ignore collision of the head with itself
        } else {
          // Snake is dead. Game over.
          this.snake.dead = true;
          this.looper.pause();
          break;
        }

        // Handle collision of the snake with items
        const snakeHead = this.snake.body[this.snake.body.length - 1];
        const activatedItem = this.itemManager.activate(
          snakeHead.x,
          snakeHead.y,
        );
        if (activatedItem === null) {
          // No item was activated
        } else {
          console.log(activatedItem);
          if (activatedItem === 'grow') {
            this.snake.grow(1);
          } else if (activatedItem === 'shrink') {
            this.snake.shrink(1);
          }
        }
      }

      this.statusElement.innerText = `Snake length: ${
        this.snake.body.length
      }\nProbabilities: ${this.itemManager.quantumCircuit.probabilities()}\nQubit state:\n${this.itemManager.quantumCircuit.stateAsString()}\nPairwise Concurrence:\n${this.itemManager.degreesOfEntanglementMatrix.toString()}`;
    }
  }

  updateDirection() {
    // snake can't turn 180 degrees
    if (
      this.directionCandidate === Directions.UP &&
      this.direction !== Directions.DOWN
    ) {
      this.direction = this.directionCandidate;
    } else if (
      this.directionCandidate === Directions.DOWN &&
      this.direction !== Directions.UP
    ) {
      this.direction = this.directionCandidate;
    } else if (
      this.directionCandidate === Directions.LEFT &&
      this.direction !== Directions.RIGHT
    ) {
      this.direction = this.directionCandidate;
    } else if (
      this.directionCandidate === Directions.RIGHT &&
      this.direction !== Directions.LEFT
    ) {
      this.direction = this.directionCandidate;
    }
  }

  collide(listOfPoints, point) {
    return listOfPoints.findIndex((p) => p.x === point.x && p.y === point.y);
  }
}

export default Game;
