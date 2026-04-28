// Goal: Turn the one-square measuring rule into a full shoreline measurement
// by adding the area returned from the four side-adjacent neighbors.

function measureIslandArea(grid: number[][], row: number, col: number): number {
  if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) return 0;
  if (grid[row][col] === 0) return 0;

  grid[row][col] = 0;
  throw new Error('not implemented');
}

// ---Tests
runCase(
  'measures a two-by-two island as area four',
  () => {
    const grid = cloneGrid([
      [1, 1, 0],
      [1, 1, 0],
      [0, 0, 1],
    ]);
    return {
      area: measureIslandArea(grid, 0, 0),
      grid,
    };
  },
  {
    area: 4,
    grid: [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 1],
    ],
  },
);

runCase(
  'does not add diagonal land to the same area',
  () => {
    const grid = cloneGrid([
      [1, 0],
      [0, 1],
    ]);
    return {
      area: measureIslandArea(grid, 0, 0),
      grid,
    };
  },
  {
    area: 1,
    grid: [
      [0, 0],
      [0, 1],
    ],
  },
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
