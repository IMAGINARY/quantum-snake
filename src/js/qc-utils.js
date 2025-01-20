import * as math from 'mathjs';
import QuantumCircuit from 'quantum-circuit';

function degreesOfEntanglement(circuit) {
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

function degreeOfEntanglement(circuit, q0, q1) {
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

function concurrence2(rho) {
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
function partialTrace(rho, dimA) {
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

function stateAsDensityMatrix(circuit) {
  const stateAsSimpleArray = circuit.stateAsSimpleArray();
  const stateAsSimpleMathJsArray = stateAsSimpleArray.map(({ re, im }) => [
    math.complex(re, im),
  ]);
  const phi = math.matrix(stateAsSimpleMathJsArray);
  const phiDagger = math.ctranspose(phi);
  const rho = math.multiply(phi, phiDagger);
  return rho;
}

export {
  degreesOfEntanglement,
  degreeOfEntanglement,
  concurrence2,
  partialTrace,
  stateAsDensityMatrix,
};

const defaultExport = {
  degreesOfEntanglement,
  degreeOfEntanglement,
  concurrence2,
  partialTrace,
  stateAsDensityMatrix,
};

export default defaultExport;
