/**
 * Create a custom mathjs module that only bundles needed functionality.
 * This would reduce bundle size significantly if `quantum-circuit` would
 * start using custom mathjs bundles as well.
 */

export type { Matrix, Complex, MathJsChain } from 'mathjs';
import type * as math from 'mathjs';

import {
  create,
  matrixDependencies,
  complexDependencies,
  addDependencies,
  multiplyDependencies,
  reDependencies,
  sqrtDependencies,
  // @ts-expect-error The mathjs type definition misses this module, but it is present in the mathjs source code. TODO: Write bug report.
  eigsDependencies,
  conjDependencies,
  transposeDependencies,
  kronDependencies,
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    eigsDependencies,
    conjDependencies,
    transposeDependencies,
    kronDependencies,
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
  sort,
  zeros,
  ones,
};
