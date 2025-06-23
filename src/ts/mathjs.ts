/**
 * Create a custom mathjs module that only bundles needed functionality.
 * This would reduce bundle size significantly if `quantum-circuit` would
 * start using custom mathjs bundles as well.
 */

export type { Matrix, Complex, MathJsChain, MathCollection } from 'mathjs';
import type * as math from 'mathjs';

import {
  create,
  matrixDependencies,
  complexDependencies,
  addDependencies,
  multiplyDependencies,
  reDependencies,
  sqrtDependencies,
  eigsDependencies,
  conjDependencies,
  transposeDependencies,
  kronDependencies,
  sizeDependencies,
  sortDependencies,
  zerosDependencies,
  onesDependencies,
} from 'mathjs';

const config = {
  // optionally, you can specify configuration
};

const {
  matrix,
  complex,
  add,
  multiply,
  re,
  sqrt,
  eigs,
  conj,
  transpose,
  kron,
  size,
  sort,
  zeros,
  ones,
} = create(
  {
    matrixDependencies,
    complexDependencies,
    addDependencies,
    multiplyDependencies,
    reDependencies,
    sqrtDependencies,
    eigsDependencies,
    conjDependencies,
    transposeDependencies,
    kronDependencies,
    sizeDependencies,
    sortDependencies,
    zerosDependencies,
    onesDependencies,
  },
  config,
) as {
  matrix: typeof math.matrix;
  complex: typeof math.complex;
  add: typeof math.add;
  multiply: typeof math.multiply;
  re: typeof math.re;
  sqrt: typeof math.sqrt;
  eigs: typeof math.eigs;
  conj: typeof math.conj;
  transpose: typeof math.transpose;
  kron: typeof math.kron;
  size: typeof math.size;
  sort: typeof math.sort;
  zeros: typeof math.zeros;
  ones: typeof math.ones;
};

export {
  matrix,
  complex,
  add,
  multiply,
  re,
  sqrt,
  eigs,
  conj,
  transpose,
  kron,
  size,
  sort,
  zeros,
  ones,
};
