import QuantumCircuit from 'quantum-circuit';
import QCUtils from './qc-utils';

export class ItemManager {
  constructor(game) {
    this.game = game;

    const config = this.game.config;
    const { numQubits, numGates } = config;

    // Start with qubits 0 and 1 entangled
    this.quantumCircuit = new QuantumCircuit(numQubits);
    this.quantumCircuit.appendGate('h', [0]);
    this.quantumCircuit.appendGate('cx', [0, 1]);
    this.quantumCircuit.run();

    this.qubitPositions = new Array(numQubits)
      .fill(0)
      .map((_, i) => ({ x: 0, y: 0 }));
    this.quantumLogicGates = new Array(numGates)
      .fill(0)
      .map((_, i) => ({ x: 0, y: 0 }));

    this.qubitPositions.forEach((_, i) => this.renewQubit(i));
    this.quantumLogicGates.forEach((_, i) => this.renewQuantumLogicGate(i));

    this.degreesOfEntanglementMatrix = QCUtils.degreesOfEntanglement(
      this.quantumCircuit,
    );
    console.log(this.degreesOfEntanglementMatrix.toString());
  }

  activate(x, y) {
    const qubitIndex = this.qubitPositions.findIndex(
      (q) => q.x === x && q.y === y,
    );
    if (qubitIndex !== -1) {
      // Measure qubit
      const bit = this.quantumCircuit.measure(qubitIndex);

      // Reset qubit to the measured value to update entangled qubits
      this.quantumCircuit.resetQubit(qubitIndex, bit);

      console.log(this.quantumCircuit.stateAsString());
      console.log(this.quantumCircuit.probabilities());

      // Renew the qubit item
      this.renewQubit(qubitIndex);

      this.degreesOfEntanglementMatrix = QCUtils.degreesOfEntanglement(
        this.quantumCircuit,
      );
      console.log(this.degreesOfEntanglementMatrix.toString());

      console.log(this.quantumCircuit.stateAsString());
      console.log(this.quantumCircuit.probabilities());

      // Return "grow" or "shrink" depending on measurement result
      return bit === 0 ? 'grow' : 'shrink';
    }

    const gateIndex = this.quantumLogicGates.findIndex(
      (g) => g.x === x && g.y === y,
    );
    if (gateIndex !== -1) {
      console.log(
        'Applying quantum logic gate',
        this.quantumLogicGates[gateIndex],
      );

      // Clear quantum logic gates of circuit
      this.quantumCircuit.clearGates();

      // Append quantum logic gates to (empty) circuit
      this.quantumCircuit.appendGate(
        this.quantumLogicGates[gateIndex].name,
        this.quantumLogicGates[gateIndex].qubits,
      );

      // Run circuit using the current qubit values
      this.quantumCircuit.run(undefined, { continue: true });

      this.degreesOfEntanglementMatrix = QCUtils.degreesOfEntanglement(
        this.quantumCircuit,
      );
      console.log(this.degreesOfEntanglementMatrix.toString());

      console.log(this.quantumCircuit.stateAsString());
      console.log(this.quantumCircuit.probabilities());

      // Renew the quantum logic gate item
      this.renewQuantumLogicGate(gateIndex);

      return 'gate';
    }

    return null;
  }

  renewQubit(qubitIndex) {
    if (qubitIndex < 0 || qubitIndex >= this.qubitPositions.length) {
      return;
    }

    // TODO: Reset qubit to |0>
    // TODO: apply random rotation to qubit (3 random Euler angles)

    // Move qubit to a random free position
    Object.assign(
      this.qubitPositions[qubitIndex],
      this.getRandomFreePosition(),
    );
  }

  renewQuantumLogicGate(gateIndex) {
    if (gateIndex < 0 || gateIndex >= this.quantumLogicGates.length) {
      return;
    }

    const gatesNamesWithNumOfQubits = { x: 1, h: 1, cx: 2 };
    const gateNames = Object.keys(gatesNamesWithNumOfQubits);
    const name = gateNames[Math.floor(Math.random() * gateNames.length)];

    const shuffledQubitIndices = this.qubitPositions.map((_, i) => i);
    for (let i = shuffledQubitIndices.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledQubitIndices[i], shuffledQubitIndices[j]] = [
        shuffledQubitIndices[j],
        shuffledQubitIndices[i],
      ];
    }

    const qubits = shuffledQubitIndices.slice(
      0,
      gatesNamesWithNumOfQubits[name],
    );

    // Move gate to a random free position
    Object.assign(
      this.quantumLogicGates[gateIndex],
      this.getRandomFreePosition(),
      { name, qubits },
    );
  }

  getRandomPosition() {
    const { boardWidth, boardHeight } = this.game.config;
    return {
      x: Math.floor(Math.random() * boardWidth),
      y: Math.floor(Math.random() * boardHeight),
    };
  }

  isFreePosition(x, y) {
    return (
      !this.qubitPositions.some((q) => q.x === x && q.y === y) &&
      !this.quantumLogicGates.some((g) => g.x === x && g.y === y) &&
      !this.game.snake.body.some((s) => s.x === x && s.y === y)
    );
  }

  getRandomFreePosition() {
    while (true) {
      const randomPosition = this.getRandomPosition();
      if (this.isFreePosition(randomPosition.x, randomPosition.y)) {
        return randomPosition;
      }
    }
  }
}

export default ItemManager;
