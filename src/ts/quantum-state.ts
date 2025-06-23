import QuantumCircuit from 'quantum-circuit';
import { stateAsStateVector } from './qc-utils';
import { assert } from 'ts-essentials';

export type Player = 0 | 1;
export type QuantumGateType = 'x' | 'h' | 'swap' | 'cx';

export interface QuantumGateSpec {
  type: QuantumGateType;
  qubits: number[];
}

export class QuantumState {
  public readonly numQubits: number;

  public readonly playerQubits: readonly (readonly number[])[];

  protected readonly quantumCircuit: QuantumCircuit;

  constructor(numQubits: number, playerQubits: readonly (readonly number[])[]) {
    this.numQubits = numQubits;
    this.playerQubits = [...playerQubits.map((a) => [...a])];

    this.quantumCircuit = new QuantumCircuit(this.numQubits);
  }

  measure(player: Player): (0 | 1)[] {
    const values = this.playerQubits[player].map((q) => {
      const value = this.quantumCircuit.measure(q);
      assert(
        value === 0 || value === 1,
        'Qubit measurement must yield 0 or 1 base state',
      );
      this.quantumCircuit.resetQubit(q, value);
      return value;
    });
    return values;
  }

  measureAll(): (0 | 1)[] {
    // Measure all qubits
    const values = this.quantumCircuit.measureAll().map((value) => {
      assert(
        value === 0 || value === 1,
        'Qubit measurement must yield 0 or 1 base state',
      );
      return value;
    });

    // Reinitialize the quantum state to the measurement results
    this.quantumCircuit.clearGates();
    this.quantumCircuit.run(values);

    return values;
  }

  measureAllPlayers(): (0 | 1)[][] {
    const values = this.measureAll();
    const valuesPerPlayers = this.playerQubits.map((playerQubits) => {
      const playerValues = playerQubits.map((q) => values[q]);
      return playerValues;
    });
    return valuesPerPlayers;
  }

  protected applyGate(gateSpec: QuantumGateSpec) {
    this.quantumCircuit.appendGate(gateSpec.type, gateSpec.qubits, {});
    this.quantumCircuit.run(undefined, { continue: true });
    this.quantumCircuit.clearGates();
  }

  applyGateX(player: Player) {
    const gateSpec: QuantumGateSpec = {
      type: 'x',
      qubits: [this.playerQubits[player][0]],
    };
    this.applyGate(gateSpec);
  }

  applyGateH(player: Player) {
    const gateSpec: QuantumGateSpec = {
      type: 'h',
      qubits: [this.playerQubits[player][0]],
    };
    this.applyGate(gateSpec);
  }

  applyGateSwap(player: Player) {
    const gateSpec: QuantumGateSpec = {
      type: 'swap',
      qubits: [this.playerQubits[player][0], this.playerQubits[player][1]],
    };
    this.applyGate(gateSpec);
  }

  applyGateCX(player: Player) {
    const gateSpec: QuantumGateSpec = {
      type: 'cx',
      qubits: [this.playerQubits[player][0], this.playerQubits[player][1]],
    };
    this.applyGate(gateSpec);
  }

  get stateVector(): { re: number; im: number }[] {
    return stateAsStateVector(this.quantumCircuit);
  }

  get probabilities(): number[] {
    return this.quantumCircuit.probabilities();
  }
}
