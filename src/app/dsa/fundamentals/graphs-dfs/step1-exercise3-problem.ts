// Goal: Practice measuring every island once and keeping the largest DFS area.
//
// Return the size of the largest connected land region in a 0/1 grid.
//
// Example:
//   largestIslandArea([[1,1,0],[0,1,0],[1,0,1]]) -> 3
//   largestIslandArea([[0,0],[0,0]])             -> 0
function largestIslandArea(grid: number[][]): number {
  throw new Error('not implemented');
}

// ---Tests
test(
  'finds the largest of several islands',
  () => largestIslandArea([[1, 1, 0], [0, 1, 0], [1, 0, 1]]),
  3,
);
test(
  'returns zero when there is no land',
  () => largestIslandArea([[0, 0], [0, 0]]),
  0,
);
test(
  'counts a single-cell island',
  () => largestIslandArea([[0, 1, 0]]),
  1,
);
test(
  'handles one large connected region',
  () => largestIslandArea([[1, 1], [1, 1]]),
  4,
);
test(
  'ignores diagonal-only touching cells',
  () => largestIslandArea([[1, 0, 1], [0, 0, 0], [1, 0, 1]]),
  1,
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
