// Goal: Complete solution. Scan the grid, count each fresh shoreline once,
// and erase it immediately with DFS so no island can be counted twice.

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
  let islands = 0;

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col] === '0') continue;

      islands++;
      sinkIsland(grid, row, col);
    }
  }

  return islands;
}

// Tests — all must print PASS
runCase(
  'example 1 has one island',
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
  'example 2 has three islands',
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
  'diagonal land is not connected',
  () =>
    numIslands(
      cloneGrid([
        ['1', '0', '1'],
        ['0', '1', '0'],
        ['1', '0', '1'],
      ]),
    ),
  5,
);

runCase(
  'single row alternates between islands and water',
  () =>
    numIslands(
      cloneGrid([
        ['1', '0', '1', '1', '0', '1'],
      ]),
    ),
  3,
);

runCase(
  'all water has zero islands',
  () =>
    numIslands(
      cloneGrid([
        ['0', '0'],
        ['0', '0'],
      ]),
    ),
  0,
);

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
