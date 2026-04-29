// Goal: Practice flood filling one connected room cluster in a grid using DFS.
//
// Recolor every orthogonally connected cell that matches the start cell's value.
//
// Example:
//   floodFillRegion([[1,1,0],[1,0,0],[1,1,1]], 0, 0, 9) -> [[9,9,0],[9,0,0],[9,9,9]]
//   floodFillRegion([[2,2],[2,3]], 1, 1, 7)             -> [[2,2],[2,7]]
function floodFillRegion(
  grid: number[][],
  startRow: number,
  startCol: number,
  newValue: number,
): number[][] {
  throw new Error('not implemented');
}

// ---Tests
test(
  'fills a full connected region',
  () => floodFillRegion([[1, 1, 0], [1, 0, 0], [1, 1, 1]], 0, 0, 9),
  [[9, 9, 0], [9, 0, 0], [9, 9, 9]],
);
test(
  'changes only the single start cell when neighbors do not match',
  () => floodFillRegion([[2, 2], [2, 3]], 1, 1, 7),
  [[2, 2], [2, 7]],
);
test(
  'leaves the grid unchanged when start is out of bounds',
  () => floodFillRegion([[1, 1], [1, 0]], 3, 0, 5),
  [[1, 1], [1, 0]],
);
test(
  'works on a one-cell grid',
  () => floodFillRegion([[4]], 0, 0, 8),
  [[8]],
);
test(
  'stops at cells with a different original value',
  () => floodFillRegion([[1, 1, 2], [1, 2, 2], [1, 1, 2]], 0, 0, 5),
  [[5, 5, 2], [5, 2, 2], [5, 5, 2]],
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
