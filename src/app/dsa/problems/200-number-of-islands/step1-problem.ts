// Goal: Build the base flood-fill rule. Ignore off-map coordinates and water,
// then flip one valid land square from '1' to '0' so it cannot be counted again.

function sinkIsland(grid: string[][], row: number, col: number): void {
  throw new Error('not implemented');
}

// ---Tests
runCase(
  'off-map coordinates leave the grid unchanged',
  () => {
    const grid = cloneGrid([
      ['1', '0'],
      ['0', '1'],
    ]);
    sinkIsland(grid, -1, 0);
    return grid;
  },
  [
    ['1', '0'],
    ['0', '1'],
  ],
);

runCase(
  'water squares stay unchanged',
  () => {
    const grid = cloneGrid([
      ['1', '0'],
      ['0', '1'],
    ]);
    sinkIsland(grid, 0, 1);
    return grid;
  },
  [
    ['1', '0'],
    ['0', '1'],
  ],
);

runCase(
  'one land square gets painted to water',
  () => {
    const grid = cloneGrid([
      ['1', '0'],
      ['0', '1'],
    ]);
    sinkIsland(grid, 1, 1);
    return grid;
  },
  [
    ['1', '0'],
    ['0', '0'],
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
