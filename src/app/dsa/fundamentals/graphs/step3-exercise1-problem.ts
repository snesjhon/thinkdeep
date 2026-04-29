// Goal: Practice reading a city block grid as an implicit graph by listing valid orthogonal neighbors.
//
// Return the in-bounds neighbor coordinates for one cell in this exact order: up, right, down, left.
//
// Example:
//   orthogonalBlockNeighbors([[1,1,0],[0,1,0],[1,0,1]], 1, 1) -> [[0,1],[1,2],[2,1],[1,0]]
//   orthogonalBlockNeighbors([[1]], 0, 0)                     -> []
type Coord = [number, number];

function orthogonalBlockNeighbors(grid: number[][], row: number, col: number): Coord[] {
  throw new Error('not implemented');
}

// ---Tests
check('single cell has no neighbors', () => orthogonalBlockNeighbors([[1]], 0, 0), []);
check(
  'center cell returns four orthogonal neighbors',
  () => orthogonalBlockNeighbors([[1, 1, 0], [0, 1, 0], [1, 0, 1]], 1, 1),
  [[0, 1], [1, 2], [2, 1], [1, 0]],
);
check(
  'top left corner has only right and down',
  () => orthogonalBlockNeighbors([[1, 1], [1, 0]], 0, 0),
  [[0, 1], [1, 0]],
);
check(
  'top edge cell skips out of bounds coordinates',
  () => orthogonalBlockNeighbors([[1, 1, 1], [0, 1, 0]], 0, 1),
  [[0, 2], [1, 1], [0, 0]],
);
check(
  'bottom right corner has only up and left',
  () => orthogonalBlockNeighbors([[1, 0], [1, 1]], 1, 1),
  [[0, 1], [1, 0]],
);
// ---End Tests

// ---Helpers
function check(desc: string, fn: () => unknown, expected: unknown): void {
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
