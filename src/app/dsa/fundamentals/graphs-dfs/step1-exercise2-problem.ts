// Goal: Practice counting the size of one connected land region with DFS.
//
// Return how many orthogonally connected cells with value 1 are reachable from the start cell.
//
// Example:
//   countReachableLand([[1,1,0],[1,0,0],[1,1,1]], 0, 0) -> 6
//   countReachableLand([[0,1],[1,1]], 0, 0)             -> 0
function countReachableLand(
  grid: number[][],
  startRow: number,
  startCol: number,
): number {
  throw new Error('not implemented');
}

// ---Tests
test(
  'counts every connected land cell in the region',
  () => countReachableLand([[1, 1, 0], [1, 0, 0], [1, 1, 1]], 0, 0),
  6,
);
test(
  'returns zero when the start cell is water',
  () => countReachableLand([[0, 1], [1, 1]], 0, 0),
  0,
);
test(
  'returns one for a single isolated land cell',
  () => countReachableLand([[0, 0], [0, 1]], 1, 1),
  1,
);
test(
  'avoids counting diagonal-only contact',
  () => countReachableLand([[1, 0], [0, 1]], 0, 0),
  1,
);
test(
  'returns zero when the start is outside the grid',
  () => countReachableLand([[1, 1], [1, 1]], -1, 0),
  0,
);
// ---End Tests

// ---Helpers
function test(desc: string, fn: () => unknown, expected: unknown): void {
  try {
    const actual = fn();
    const pass = JSON.stringify(actual) === JSON.stringify(expected);
    console.log(`${pass ? 'PASS' : 'FAIL'} ${desc}`);
    if (!pass) {
      console.log(`  expected: ${JSON.stringify(expected)}`);
      console.log(`  received: ${JSON.stringify(actual)}`);
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'not implemented') {
      console.log(`TODO  ${desc}`);
    } else {
      throw error;
    }
  }
}
// ---End Helpers
