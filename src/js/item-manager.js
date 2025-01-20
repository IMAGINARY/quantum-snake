import QuantumCircuit from 'quantum-circuit';
import * as math from 'mathjs';

export class ItemManager {
  // TODO: snakeBody should not be passed here (it's just used to avoid collisions)
  constructor(
    numQubits,
    numGates,
    snakeBody,
    boardWidth,
    boardHeight,
    blockSize,
  ) {
    this.snakeBody = snakeBody;
    this.boardWidth = boardWidth;
    this.boardHeight = boardHeight;
    this.blockSize = blockSize;

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

    this.degreesOfEntanglementMatrix = this.degreesOfEntanglement(
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

      this.degreesOfEntanglementMatrix = this.degreesOfEntanglement(
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

      this.degreesOfEntanglementMatrix = this.degreesOfEntanglement(
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

  degreesOfEntanglement(circuit) {
    const degrees = math.ones(circuit.numQubits, circuit.numQubits);

    for (let q0 = 0; q0 < circuit.numQubits - 1; q0 += 1) {
      for (let q1 = q0 + 1; q1 < circuit.numQubits; q1 += 1) {
        const degreeOfEntanglement = this.degreeOfEntanglement(circuit, q0, q1);
        degrees.set([q0, q1], degreeOfEntanglement);
        degrees.set([q1, q0], degreeOfEntanglement);
      }
    }

    return degrees;
  }

  degreeOfEntanglement(circuit, q0, q1) {
    console.log(q0, q1);

    if (q0 === q1) return 1; // qubits are always entangled with themselves

    const tempCircuit = new QuantumCircuit(circuit.numQubits);
    if (q0 !== circuit.numQubits - 1) {
      // move the first target qubit to the last qubit
      tempCircuit.appendGate('swap', [circuit.numQubits - 1, q0]);
      if (q1 === circuit.numQubits - 1) {
        // q1 was the last qubit, but is now at q0's original position
        q1 = q0;
      }
    }
    if (q1 !== circuit.numQubits - 2) {
      // move the second target qubit to the second to last qubit
      tempCircuit.appendGate('swap', [circuit.numQubits - 2, q1]);
    }

    tempCircuit.run(null, {
      initialState: { ...circuit.state },
    });

    const tempRho = this.stateAsDensityMatrix(tempCircuit);
    console.log(tempCircuit.stateAsString());
    console.log(tempRho.toString());

    const tempRho2 = this.partialTrace(tempRho, 2 * 2);
    const concurrence = this.concurrence2(tempRho2);

    console.log('Concurrence', q0, q1, concurrence);

    return concurrence;
  }

  concurrence2(rho) {
    console.log(rho.toString());

    if (rho.size()[0] !== 4 || rho.size()[1] !== 4) {
      throw new Error('Density matrix must be 4x4');
    }

    const sigmaY = math.matrix([
      [0, math.complex(0, -1)],
      [math.complex(0, 1), 0],
    ]);
    const sigmaYTensorSigmaY = math.kron(sigmaY, sigmaY);
    const rhoConjugate = rho.map((v) => v.conjugate());
    const rhoTilde = math.multiply(
      math.multiply(sigmaYTensorSigmaY, rhoConjugate),
      sigmaYTensorSigmaY,
    );

    // TODO: check that the eigenvalues are actually real
    const eigenValues = math.eigs(math.multiply(rho, rhoTilde), {
      eigenvectors: false,
    }).values;
    console.log(eigenValues.toString());

    const realEigenvalues = eigenValues.map((eigenvalue) =>
      Math.sqrt(math.re(eigenvalue)),
    );
    const decrRealEigenvalues = math.sort(realEigenvalues, 'desc');
    console.log(decrRealEigenvalues.toString());

    // TODO: make sure we actually have four eigenvalues
    const [lambda0, lambda1, lambda2, lambda3] = [
      decrRealEigenvalues.get([0]),
      decrRealEigenvalues.get([1]),
      decrRealEigenvalues.get([2]),
      decrRealEigenvalues.get([3]),
    ];

    return Math.min(Math.max(0, lambda0 - lambda1 - lambda2 - lambda3), 1);
  }

  // https://arxiv.org/pdf/1601.07458/1000
  partialTrace(rho, dimA) {
    const dimB = rho.size()[0] / dimA;
    console.log({ dimA, dimB });
    const rhoA = math.zeros(dimA, dimA).map((_, [k, l]) => {
      let rhoA_kl = math.complex(0, 0);
      for (let j = 0; j < dimB; j += 1) {
        rhoA_kl = math.add(rhoA_kl, rho.get([k * dimB + j, l * dimB + j]));
      }
      return rhoA_kl;
    });
    return rhoA;
  }

  stateAsDensityMatrix(circuit) {
    const stateAsSimpleArray = circuit.stateAsSimpleArray();
    const stateAsSimpleMathJsArray = stateAsSimpleArray.map(({ re, im }) => [
      math.complex(re, im),
    ]);
    const phi = math.matrix(stateAsSimpleMathJsArray);
    const phiDagger = math.ctranspose(phi);
    const rho = math.multiply(phi, phiDagger);
    return rho;
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
    return {
      x: Math.floor(Math.random() * this.boardWidth),
      y: Math.floor(Math.random() * this.boardHeight),
    };
  }

  isFreePosition(x, y) {
    return (
      !this.qubitPositions.some((q) => q.x === x && q.y === y) &&
      !this.quantumLogicGates.some((g) => g.x === x && g.y === y) &&
      !this.snakeBody.some((s) => s.x === x && s.y === y)
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

  render(ctx) {
    ctx.save();
    this.renderQuantumLogicGates(ctx);
    ctx.restore();

    ctx.save();
    this.renderQubits(ctx);
    ctx.restore();
  }

  renderQubits(ctx) {
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    for (let i = 0; i < this.qubitPositions.length; i += 1) {
      const xStart =
        this.qubitPositions[i].x * this.blockSize + this.blockSize / 2;
      const yStart =
        this.qubitPositions[i].y * this.blockSize + this.blockSize / 2;

      for (let j = i + 1; j < this.qubitPositions.length; j += 1) {
        const xEnd =
          this.qubitPositions[j].x * this.blockSize + this.blockSize / 2;
        const yEnd =
          this.qubitPositions[j].y * this.blockSize + this.blockSize / 2;

        const percentage = Math.round(
          this.degreesOfEntanglementMatrix.get([i, j]) * 100,
        );

        ctx.strokeStyle = `rgba(255, 255, 0, ${percentage / 100})`;
        ctx.beginPath();
        ctx.moveTo(xStart, yStart);
        ctx.lineTo(xEnd, yEnd);
        ctx.stroke();
      }
    }

    ctx.lineWidth = this.blockSize;
    ctx.lineCap = 'round';
    ctx.fillStyle = 'white';
    ctx.font = `${this.blockSize}px sans-serif`;

    const probabilities = this.quantumCircuit.probabilities();

    this.qubitPositions.forEach(({ x: blockX, y: blockY }, i) => {
      const percentage = Math.round(probabilities[i] * 100);
      // TODO: Mix color in JS for compatibility with all browsers
      ctx.strokeStyle = `color-mix(in hsl, red ${percentage}%, green ${
        100 - percentage
      }%)`;
      ctx.beginPath();
      const x = blockX * this.blockSize + this.blockSize / 2;
      const y = blockY * this.blockSize + this.blockSize / 2;
      ctx.moveTo(x, y);
      ctx.lineTo(x, y);
      ctx.stroke();

      ctx.fillText(i, x, y);
    });
  }

  renderQuantumLogicGates(ctx) {
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'blue';
    this.quantumLogicGates.forEach(({ x: blockX, y: blockY, qubits }, i) => {
      const xStart = blockX * this.blockSize + this.blockSize / 2;
      const yStart = blockY * this.blockSize + this.blockSize / 2;

      qubits.forEach((qubit) => {
        const xEnd =
          this.qubitPositions[qubit].x * this.blockSize + this.blockSize / 2;
        const yEnd =
          this.qubitPositions[qubit].y * this.blockSize + this.blockSize / 2;
        ctx.beginPath();
        ctx.moveTo(xStart, yStart);
        ctx.lineTo(xEnd, yEnd);
        ctx.stroke();
      });
    });

    ctx.lineWidth = this.blockSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'blue';
    ctx.fillStyle = 'white';
    ctx.font = `${this.blockSize}px sans-serif`;
    this.quantumLogicGates.forEach(({ x: blockX, y: blockY, name }, i) => {
      ctx.beginPath();
      const x = blockX * this.blockSize + this.blockSize / 2;
      const y = blockY * this.blockSize + this.blockSize / 2;
      ctx.moveTo(x, y);
      ctx.lineTo(x, y);
      ctx.stroke();

      ctx.fillText(name, x, y);
    });
  }
}

export default ItemManager;
