// Goal: Practice reading a city block grid as an implicit graph by listing valid orthogonal neighbors.
type Coord = [number, number];

function orthogonalBlockNeighbors(grid: number[][], row: number, col: number): Coord[] {
  const candidates: Coord[] = [
    [row - 1, col],
    [row, col + 1],
    [row + 1, col],
    [row, col - 1],
  ];

  return candidates.filter(
    ([r, c]) => r >= 0 && r < grid.length && c >= 0 && c < grid[0].length,
  );
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
  const actual = fn();
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${pass ? 'PASS' : 'FAIL'} ${desc}`);
  if (!pass) {
    console.log(`  expected: ${JSON.stringify(expected)}`);
    console.log(`  received: ${JSON.stringify(actual)}`);
  }
}
// ---End Helpers
