// Goal: Practice measuring every island once and keeping the largest DFS area.
//
// Return the size of the largest connected land region in a 0/1 grid.
//
// Example:
//   largestIslandArea([[1,1,0],[0,1,0],[1,0,1]]) -> 3
//   largestIslandArea([[0,0],[0,0]])             -> 0
function largestIslandArea(grid: number[][]): number {
  if (grid.length === 0) return 0;

  const seen = Array.from({ length: grid.length }, () =>
    Array(grid[0].length).fill(false),
  );

  function dfs(row: number, col: number): number {
    if (
      row < 0 ||
      row >= grid.length ||
      col < 0 ||
      col >= grid[0].length ||
      grid[row][col] !== 1 ||
      seen[row][col]
    ) {
      return 0;
    }

    seen[row][col] = true;
    return (
      1 +
      dfs(row - 1, col) +
      dfs(row, col + 1) +
      dfs(row + 1, col) +
      dfs(row, col - 1)
    );
  }

  let best = 0;
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[0].length; col++) {
      if (grid[row][col] === 1 && !seen[row][col]) {
        best = Math.max(best, dfs(row, col));
      }
    }
  }

  return best;
}

// ---Tests
test(
  'finds the largest of several islands',
  () => largestIslandArea([[1, 1, 0], [0, 1, 0], [1, 0, 1]]),
  3,
);
test(
  'returns zero when there is no land',
  () => largestIslandArea([[0, 0], [0, 0]]),
  0,
);
test(
  'counts a single-cell island',
  () => largestIslandArea([[0, 1, 0]]),
  1,
);
test(
  'handles one large connected region',
  () => largestIslandArea([[1, 1], [1, 1]]),
  4,
);
test(
  'ignores diagonal-only touching cells',
  () => largestIslandArea([[1, 0, 1], [0, 0, 0], [1, 0, 1]]),
  1,
);
// ---End Tests

// ---Helpers
function test(desc: string, fn: () => unknown, expected: unknown): void {
  const actual = fn();
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${pass ? 'PASS' : 'FAIL'} ${desc}`);
  if (!pass) {
    console.log(`  expected: ${JSON.stringify(expected)}`);
    console.log(`  received: ${JSON.stringify(actual)}`);
  }
}
// ---End Helpers
