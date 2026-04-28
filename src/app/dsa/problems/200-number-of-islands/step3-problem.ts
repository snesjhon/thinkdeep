// Goal: Scan the whole map. Each time you find fresh land, count one island
// and launch the flood fill to erase that entire shoreline.

function sinkIsland(grid: string[][], row: number, col: number): void {
  if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) return;
  if (grid[row][col] === '0') return;

  grid[row][col] = '0';

  sinkIsland(grid, row - 1, col);
  sinkIsland(grid, row + 1, col);
  sinkIsland(grid, row, col - 1);
  sinkIsland(grid, row, col + 1);
}

function numIslands(grid: string[][]): number {
  throw new Error('not implemented');
}

// ---Tests
runCase(
  'counts one large island',
  () =>
    numIslands(
      cloneGrid([
        ['1', '1', '1', '1', '0'],
        ['1', '1', '0', '1', '0'],
        ['1', '1', '0', '0', '0'],
        ['0', '0', '0', '0', '0'],
      ]),
    ),
  1,
);

runCase(
  'counts three separate islands',
  () =>
    numIslands(
      cloneGrid([
        ['1', '1', '0', '0', '0'],
        ['1', '1', '0', '0', '0'],
        ['0', '0', '1', '0', '0'],
        ['0', '0', '0', '1', '1'],
      ]),
    ),
  3,
);

runCase(
  'counts zero islands in all water',
  () =>
    numIslands(
      cloneGrid([
        ['0', '0'],
        ['0', '0'],
      ]),
    ),
  0,
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
