// Goal: Complete solution. Measure each island with DFS, erase it immediately,
// and keep the largest returned area seen during the full grid scan.

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
  let maxArea = 0;

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col] === 0) continue;

      maxArea = Math.max(maxArea, measureIslandArea(grid, row, col));
    }
  }

  return maxArea;
}

// Tests — all must print PASS
runCase(
  'example 1 has max area 6',
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
  'example 2 has no island area',
  () =>
    maxAreaOfIsland(
      cloneGrid([[0, 0, 0, 0, 0, 0, 0, 0]]),
    ),
  0,
);

runCase(
  'separate islands keep only the largest area',
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

runCase(
  'diagonal land does not merge into one island',
  () =>
    maxAreaOfIsland(
      cloneGrid([
        [1, 0, 1],
        [0, 1, 0],
        [1, 0, 1],
      ]),
    ),
  1,
);

runCase(
  'one solid block returns its full area',
  () =>
    maxAreaOfIsland(
      cloneGrid([
        [1, 1, 1],
        [1, 1, 1],
      ]),
    ),
  6,
);

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
