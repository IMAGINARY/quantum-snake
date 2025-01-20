import Directions from './directions.js';

const MIN_LENGTH = 2;

export class Snake {
    constructor(boardWidth, boardHeight,blockSize) {
        this.boardWidth = boardWidth;
        this.boardHeight = boardHeight;
        this.blockSize = blockSize;
        this.body = [{ x: 0, y: 10 }];
        this.maxLength = MIN_LENGTH;
        this.maxLength = 10;
        this.dead = false;
    }

    move(direction) {
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

        newHead.x = (this.boardWidth + newHead.x) % this.boardWidth;
        newHead.y = (this.boardHeight + newHead.y) % this.boardHeight;

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

    render(ctx) {
        ctx.lineWidth = this.blockSize;
        ctx.lineCap = "round";

        const headColor = this.dead ? "red" : "white";
        const tailColor = "grey";

        this.body.forEach(({ x: blockX, y: blockY }, i) => {
            ctx.strokeStyle =
                i === this.body.length - 1 ? headColor : tailColor;
            ctx.beginPath();
            const x = blockX * this.blockSize + this.blockSize / 2;
            const y = blockY * this.blockSize + this.blockSize / 2;
            ctx.moveTo(x, y);
            ctx.lineTo(x, y);
            ctx.stroke();
        });
    }
}

export default Snake;
