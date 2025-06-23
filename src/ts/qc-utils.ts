import { assert } from 'ts-essentials';
import * as math from './mathjs';
import QuantumCircuit from 'quantum-circuit';

function stateAsStateVector(circuit: QuantumCircuit): math.Complex[] {
  const stateVector = circuit.state;
  const dims = math.size(stateVector);
  assert(Array.isArray(dims) && dims.length === 1);
  const size = dims[0];
  assert(Array.isArray(stateVector));

  return new Array(size).fill(0).map((_, i) => {
    assert(!Array.isArray(stateVector[i]));
    return { ...stateVector[i] };
  });
}

function stateAsDensityMatrix(
  circuit: QuantumCircuit,
): math.Matrix<math.Complex> {
  const stateAsSimpleArray = circuit.stateAsSimpleArray(false) as {
    re: number;
    im: number;
  }[];
  const stateAsSimpleMathJsArray = stateAsSimpleArray.map(({ re, im }) => [
    math.complex(re, im),
  ]);
  const phi = math.matrix(stateAsSimpleMathJsArray);
  const phiDagger = math.conj(math.transpose(phi));
  const rho = math.multiply(phi, phiDagger) as math.Matrix<math.Complex>;
  return rho;
}

function concurrence2(rho: math.Matrix<math.Complex>): number {
  console.log(rho.toString());

  if (rho.size()[0] !== 4 || rho.size()[1] !== 4) {
    throw new Error('Density matrix must be 4x4');
  }

  const sigmaY = math.matrix([
    [0, math.complex(0, -1)],
    [math.complex(0, 1), 0],
  ]);
  const sigmaYTensorSigmaY = math.kron(sigmaY, sigmaY);
  const rhoConjugate = rho.map((v: math.Complex) => math.conj(v));
  const rhoTilde = math.multiply(
    math.multiply(sigmaYTensorSigmaY, rhoConjugate),
    sigmaYTensorSigmaY,
  );

  // TODO: check that the eigenvalues must actually be real (is the matrix Hermitian?)
  //       despite being wrapped into math.Complex
  const { values: eigenvalues } = math.eigs(math.multiply(rho, rhoTilde), {
    eigenvectors: false,
  }) as { values: math.Matrix<math.Complex> };
  console.log(eigenvalues.toString());

  const realEigenvalueSqrts = eigenvalues.map((eigenvalue) =>
    math.re(
      math.sqrt(
        eigenvalue as math.Complex,
      ) as unknown as math.MathJsChain<math.Complex>, // mathjs has incomplete type for math.re
    ),
  );

  const decrRealEigenvalueSqrts = math.sort(realEigenvalueSqrts, 'desc');
  console.log(decrRealEigenvalueSqrts.toString());

  // TODO: make sure we actually have four eigenvalues
  const [lambda0, lambda1, lambda2, lambda3] = [
    decrRealEigenvalueSqrts.get([0]),
    decrRealEigenvalueSqrts.get([1]),
    decrRealEigenvalueSqrts.get([2]),
    decrRealEigenvalueSqrts.get([3]),
  ] as number[];

  return Math.min(Math.max(0, lambda0 - lambda1 - lambda2 - lambda3), 1);
}

// https://arxiv.org/pdf/1601.07458/1000
function partialTrace(
  rho: math.Matrix<math.Complex>,
  dimA: number,
): math.Matrix<math.Complex> {
  const dimB = rho.size()[0] / dimA;
  console.log({ dimA, dimB });
  const rhoA = math.complex(math.zeros(dimA, dimA)).map((_, index) => {
    const [k, l] = index as number[];

    let rhoA_kl = math.complex(0, 0);
    for (let j = 0; j < dimB; j += 1) {
      rhoA_kl = math.add<math.Complex>(
        rhoA_kl,
        rho.get([k * dimB + j, l * dimB + j]) as math.Complex,
      );
    }
    return rhoA_kl;
  }) as math.Matrix<math.Complex>;
  return rhoA;
}

function degreeOfEntanglement(
  circuit: QuantumCircuit,
  firstWire: number,
  secondWire: number,
): number {
  console.log(firstWire, secondWire);

  if (firstWire === secondWire) return 1; // qubits are always entangled with themselves

  const tempCircuit = new QuantumCircuit(circuit.numQubits);
  let tempSecondWire = secondWire;
  if (firstWire !== circuit.numQubits - 1) {
    // move the first target qubit to the last qubit
    tempCircuit.appendGate('swap', [circuit.numQubits - 1, firstWire]);
    if (secondWire === circuit.numQubits - 1) {
      // secondWire was the last qubit, but is now at firstWire's original position
      tempSecondWire = firstWire;
    }
  }
  if (tempSecondWire !== circuit.numQubits - 2) {
    // move the second target qubit to the second to last qubit
    tempCircuit.appendGate('swap', [circuit.numQubits - 2, tempSecondWire]);
  }

  tempCircuit.run(undefined, {
    initialState: { ...circuit.state },
  });

  const tempRho = stateAsDensityMatrix(tempCircuit);
  console.log(tempCircuit.stateAsString());
  console.log(tempRho.toString());

  const tempRho2 = partialTrace(tempRho, 2 * 2);
  const concurrence = concurrence2(tempRho2);

  console.log('Concurrence', firstWire, secondWire, concurrence);

  return concurrence;
}

function degreesOfEntanglement(circuit: QuantumCircuit): math.Matrix<number> {
  const degrees = math.ones(
    circuit.numQubits,
    circuit.numQubits,
  ) as math.Matrix<number>;

  for (let q0 = 0; q0 < circuit.numQubits - 1; q0 += 1) {
    for (let q1 = q0 + 1; q1 < circuit.numQubits; q1 += 1) {
      const d = degreeOfEntanglement(circuit, q0, q1);
      degrees.set([q0, q1], d);
      degrees.set([q1, q0], d);
    }
  }

  return degrees;
}

export {
  degreesOfEntanglement,
  degreeOfEntanglement,
  concurrence2,
  partialTrace,
  stateAsStateVector,
  stateAsDensityMatrix,
};
