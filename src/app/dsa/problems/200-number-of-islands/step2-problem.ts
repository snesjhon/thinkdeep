// Goal: Turn the one-cell paint rule into a full shoreline survey by recursing
// up, down, left, and right after painting the current land square.

function sinkIsland(grid: string[][], row: number, col: number): void {
  if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) return;
  if (grid[row][col] === '0') return;

  grid[row][col] = '0';
  throw new Error('not implemented');
}

// ---Tests
runCase(
  'fills a two-by-two island completely',
  () => {
    const grid = cloneGrid([
      ['1', '1', '0'],
      ['1', '1', '0'],
      ['0', '0', '1'],
    ]);
    sinkIsland(grid, 0, 0);
    return grid;
  },
  [
    ['0', '0', '0'],
    ['0', '0', '0'],
    ['0', '0', '1'],
  ],
);

runCase(
  'does not cross diagonals',
  () => {
    const grid = cloneGrid([
      ['1', '0'],
      ['0', '1'],
    ]);
    sinkIsland(grid, 0, 0);
    return grid;
  },
  [
    ['0', '0'],
    ['0', '1'],
  ],
);
// ---End Tests

// ---Helpers
function cloneGrid(grid: string[][]): string[][] {
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
