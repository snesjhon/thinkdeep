// Goal: Build the base measuring rule. Ignore off-map coordinates and water,
// then let one valid land square contribute area 1 and mark it as visited.

function measureIslandArea(grid: number[][], row: number, col: number): number {
  throw new Error('not implemented');
}

// ---Tests
runCase(
  'off-map coordinates contribute zero area',
  () => {
    const grid = cloneGrid([
      [1, 0],
      [0, 1],
    ]);
    return {
      area: measureIslandArea(grid, -1, 0),
      grid,
    };
  },
  {
    area: 0,
    grid: [
      [1, 0],
      [0, 1],
    ],
  },
);

runCase(
  'water contributes zero area',
  () => {
    const grid = cloneGrid([
      [1, 0],
      [0, 1],
    ]);
    return {
      area: measureIslandArea(grid, 0, 1),
      grid,
    };
  },
  {
    area: 0,
    grid: [
      [1, 0],
      [0, 1],
    ],
  },
);

runCase(
  'one land square contributes area one and gets marked',
  () => {
    const grid = cloneGrid([
      [1, 0],
      [0, 1],
    ]);
    return {
      area: measureIslandArea(grid, 1, 1),
      grid,
    };
  },
  {
    area: 1,
    grid: [
      [1, 0],
      [0, 0],
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
