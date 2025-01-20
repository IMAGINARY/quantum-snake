import Snake from './snake.js';
import ItemManager from './item-manager.js';
import Directions from './directions.js';

const searchParams = new URLSearchParams(window.location.search);
const numQubits = parseInt(searchParams.get("numQubits")) || 2;
const numGates = parseInt(searchParams.get("numGates")) || 1;

const BOARD_WIDTH = 50;
const BOARD_HEIGHT = 40;

const BLOCK_SIZE = 15;

export class Game {
    constructor(canvasElement, statusElement) {
        this.statusElement = statusElement;

        this.canvasElement = canvasElement;
        this.canvasElement.width = BOARD_WIDTH * BLOCK_SIZE;
        this.canvasElement.height = BOARD_HEIGHT * BLOCK_SIZE;

        this.ctx = canvasElement.getContext("2d");
        this.shouldPlay = false;
        this.lastTimestampMs = 0;
        this.durationSinceLastStepMs = 0;

        this.blocksPerSecond = 10;

        this.direction = Directions.RIGHT;
        this.directionCandidate = this.direction;
        this.snake = new Snake( BOARD_WIDTH, BOARD_HEIGHT, BLOCK_SIZE);

        this.itemManager = new ItemManager(
            numQubits,
            numGates,
            this.snake.body,
            BOARD_WIDTH,
            BOARD_HEIGHT,
            BLOCK_SIZE
        );

        const keyDirectionMap = {
            ArrowUp: Directions.UP,
            ArrowDown: Directions.DOWN,
            ArrowLeft: Directions.LEFT,
            ArrowRight: Directions.RIGHT,
        };

        const keySpeedMap = {
            "+": +1,
            "-": -1,
        };

        document.addEventListener("keydown", (event) => {
            this.directionCandidate =
                keyDirectionMap[event.key] ?? this.directionCandidate;

            this.blocksPerSecond = Math.max(
                1,
                this.blocksPerSecond + (keySpeedMap[event.key] ?? 0)
            );
        });
    }

    start() {
        this.shouldPlay = true;
        requestAnimationFrame(this.startAnimation.bind(this));
    }

    startAnimation(timestampMs) {
        this.lastTimestampMs = timestampMs;
        requestAnimationFrame(this.animate.bind(this));
    }

    animate(timestampMs) {
        if (!this.shouldPlay) return;

        const durationMs = timestampMs - this.lastTimestampMs;
        this.updateState(durationMs);
        this.render();
        this.lastTimestampMs = timestampMs;

        if (this.shouldPlay) requestAnimationFrame(this.animate.bind(this));
    }

    updateState(durationMs) {
        this.durationSinceLastStepMs += durationMs;
        if (this.durationSinceLastStepMs >= 1000 / this.blocksPerSecond) {
            this.updateDirection();
            let steps = Math.floor(
                this.durationSinceLastStepMs / (1000 / this.blocksPerSecond)
            );
            while (steps > 0) {
                // Move snake
                this.snake.move(this.direction);
                this.durationSinceLastStepMs -= 1000 / this.blocksPerSecond;
                steps -= 1;

                // Handle collision of the snake with itself
                const selfCollisionIndex = this.collide(
                    this.snake.body,
                    this.snake.body[this.snake.body.length - 1]
                );
                if (selfCollisionIndex === this.snake.body.length - 1) {
                    // Ignore collision of the head with itself
                } else {
                    // Snake is dead. Game over.
                    this.snake.dead = true;
                    this.shouldPlay = false;
                    break;
                }

                // Handle collision of the snake with items
                const snakeHead = this.snake.body[this.snake.body.length - 1];
                const activatedItem = this.itemManager.activate(
                    snakeHead.x,
                    snakeHead.y
                );
                if (activatedItem === null) {
                    // No item was activated
                } else {
                    console.log(activatedItem);
                    if (activatedItem === "grow") {
                        this.snake.grow(1);
                    } else if (activatedItem === "shrink") {
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
        return listOfPoints.findIndex(
            (p) => p.x === point.x && p.y === point.y
        );
    }

    render() {
        const ctx = this.ctx;

        ctx.save();
        ctx.fillStyle = "black";
        ctx.fillRect(
            0,
            0,
            this.canvasElement.width,
            this.canvasElement.height
        );
        ctx.restore();

        ctx.save();
        this.itemManager.render(ctx);
        ctx.restore();

        ctx.save();
        this.snake.render(ctx);
        ctx.restore();
    }
}

export default Game;
