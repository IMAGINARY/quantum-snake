export class Renderer {
  constructor(game) {
    this.game = game;
  }

  render() {
    const ctx = this.game.ctx;
    const canvasElement = this.game.canvasElement;

    ctx.save();
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
    ctx.restore();

    ctx.save();
    this.renderItems(ctx);
    ctx.restore();

    ctx.save();
    this.renderSnake(ctx);
    ctx.restore();
  }

  renderItems(ctx) {
    ctx.save();
    this.renderQuantumLogicGates(ctx);
    ctx.restore();

    ctx.save();
    this.renderQubits(ctx);
    ctx.restore();
  }

  renderQubits(ctx) {
    const { blockSize } = this.game.config;
    const { qubitPositions, quantumCircuit, degreesOfEntanglementMatrix } =
      this.game.itemManager;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    for (let i = 0; i < qubitPositions.length; i += 1) {
      const xStart = qubitPositions[i].x * blockSize + blockSize / 2;
      const yStart = qubitPositions[i].y * blockSize + blockSize / 2;

      for (let j = i + 1; j < qubitPositions.length; j += 1) {
        const xEnd = qubitPositions[j].x * blockSize + blockSize / 2;
        const yEnd = qubitPositions[j].y * blockSize + blockSize / 2;

        const percentage = Math.round(
          degreesOfEntanglementMatrix.get([i, j]) * 100,
        );

        ctx.strokeStyle = `rgba(255, 255, 0, ${percentage / 100})`;
        ctx.beginPath();
        ctx.moveTo(xStart, yStart);
        ctx.lineTo(xEnd, yEnd);
        ctx.stroke();
      }
    }

    ctx.lineWidth = blockSize;
    ctx.lineCap = 'round';
    ctx.fillStyle = 'white';
    ctx.font = `${blockSize}px sans-serif`;

    const probabilities = quantumCircuit.probabilities();

    qubitPositions.forEach(({ x: blockX, y: blockY }, i) => {
      const percentage = Math.round(probabilities[i] * 100);
      // TODO: Mix color in JS for compatibility with all browsers
      ctx.strokeStyle = `color-mix(in hsl, red ${percentage}%, green ${
        100 - percentage
      }%)`;
      ctx.beginPath();
      const x = blockX * blockSize + blockSize / 2;
      const y = blockY * blockSize + blockSize / 2;
      ctx.moveTo(x, y);
      ctx.lineTo(x, y);
      ctx.stroke();

      ctx.fillText(i, x, y);
    });
  }

  renderQuantumLogicGates(ctx) {
    const { blockSize } = this.game.config;
    const { quantumLogicGates, qubitPositions } = this.game.itemManager;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'blue';
    quantumLogicGates.forEach(({ x: blockX, y: blockY, qubits }, i) => {
      const xStart = blockX * blockSize + blockSize / 2;
      const yStart = blockY * blockSize + blockSize / 2;

      qubits.forEach((qubit) => {
        const xEnd = qubitPositions[qubit].x * blockSize + blockSize / 2;
        const yEnd = qubitPositions[qubit].y * blockSize + blockSize / 2;
        ctx.beginPath();
        ctx.moveTo(xStart, yStart);
        ctx.lineTo(xEnd, yEnd);
        ctx.stroke();
      });
    });

    ctx.lineWidth = blockSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'blue';
    ctx.fillStyle = 'white';
    ctx.font = `${blockSize}px sans-serif`;
    quantumLogicGates.forEach(({ x: blockX, y: blockY, name }, i) => {
      ctx.beginPath();
      const x = blockX * blockSize + blockSize / 2;
      const y = blockY * blockSize + blockSize / 2;
      ctx.moveTo(x, y);
      ctx.lineTo(x, y);
      ctx.stroke();

      ctx.fillText(name, x, y);
    });
  }

  renderSnake(ctx) {
    const { blockSize } = this.game.config;
    const { body } = this.game.snake;

    ctx.lineWidth = blockSize;
    ctx.lineCap = 'round';

    const headColor = this.game.snake.dead ? 'red' : 'white';
    const tailColor = 'grey';

    body.forEach(({ x: blockX, y: blockY }, i) => {
      ctx.strokeStyle = i === body.length - 1 ? headColor : tailColor;
      ctx.beginPath();
      const x = blockX * blockSize + blockSize / 2;
      const y = blockY * blockSize + blockSize / 2;
      ctx.moveTo(x, y);
      ctx.lineTo(x, y);
      ctx.stroke();
    });
  }
}

export default Renderer;
