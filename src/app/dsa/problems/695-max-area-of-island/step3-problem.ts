// Goal: Scan the whole map, measure each fresh shoreline exactly once,
// and keep the largest island area seen anywhere in the grid.

function measureIslandArea(grid: number[][], row: number, col: number): number {
  if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) return 0;
  if (grid[row][col] === 0) return 0;

  grid[row][col] = 0;

  return (
    1 +
    measureIslandArea(grid, row - 1, col) +
    measureIslandArea(grid, row + 1, col) +
    measureIslandArea(grid, row, col - 1) +
    measureIslandArea(grid, row, col + 1)
  );
}

function maxAreaOfIsland(grid: number[][]): number {
  throw new Error('not implemented');
}

// ---Tests
runCase(
  'returns six for the prompt example',
  () =>
    maxAreaOfIsland(
      cloneGrid([
        [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
        [0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0],
        [1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
      ]),
    ),
  6,
);

runCase(
  'returns zero when there is no land',
  () =>
    maxAreaOfIsland(
      cloneGrid([[0, 0, 0, 0, 0, 0, 0, 0]]),
    ),
  0,
);

runCase(
  'keeps the largest area among multiple islands',
  () =>
    maxAreaOfIsland(
      cloneGrid([
        [1, 1, 0, 0],
        [1, 0, 0, 1],
        [0, 1, 1, 1],
      ]),
    ),
  4,
);
// ---End Tests

// ---Helpers
function cloneGrid(grid: number[][]): number[][] {
  return grid.map((row) => [...row]);
}

function runCase(desc: string, fn: () => unknown, expected: unknown): void {
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
