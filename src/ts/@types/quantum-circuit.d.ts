declare module 'quantum-circuit' {
  import * as math from 'mathjs';

  export interface QuantumCircuitRunOptions {
    strictMode: boolean;
    partitioning: boolean;
    continue: boolean;
    initialState:
      | math.MathArray<math.Complex>
      | (number | string | [number, number] | math.Complex)[];
    onGate: (column: number, wire: number, gateCounter: number) => void;
    onColumn: (column: number) => void;
  }

  export default class QuantumCircuit {
    state: math.MathArray<math.Complex>;

    constructor(numQubits: number);

    get numQubits(): number;

    probabilities(): number[];

    measure(
      wire: number,
      creg?: string,
      cbit?: number,
      force?: boolean,
    ): number;

    measureAll(): number[];

    clearGates(): void;

    appendGate(
      gateName: string,
      wires: readonly number[],
      options?: unknown, // TODO: define options type
    ): string;

    stateAsSimpleArray(reverseBits?: boolean): math.Complex[];

    stateAsString(onlyPossible?: boolean): string;

    run(
      initialValues?: readonly number[],
      options?: Partial<QuantumCircuitRunOptions>,
    ): void;

    resetQubit(wire: number, value: number): void;
  }
}
