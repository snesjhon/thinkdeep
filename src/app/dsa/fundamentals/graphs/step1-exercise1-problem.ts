// Goal: Practice writing the street ledger so every two-way road appears from both intersections.
//
// Build an adjacency list for an undirected graph with nodes numbered 0 through n - 1.
// Return the neighbor lists in insertion order.
//
// Example:
//   buildStreetLedger(4, [[0, 1], [0, 2], [2, 3]]) -> [[1,2],[0],[0,3],[2]]
//   buildStreetLedger(3, [])                        -> [[],[],[]]
type Road = [number, number];

function buildStreetLedger(n: number, roads: Road[]): number[][] {
  throw new Error('not implemented');
}

// ---Tests
check('empty city keeps empty ledgers', () => buildStreetLedger(3, []), [[], [], []]);
check('single road is written both ways', () => buildStreetLedger(2, [[0, 1]]), [[1], [0]]);
check(
  'multiple roads build full neighbor lists',
  () => buildStreetLedger(4, [[0, 1], [0, 2], [2, 3]]),
  [[1, 2], [0], [0, 3], [2]],
);
check(
  'isolated node still gets an empty bucket',
  () => buildStreetLedger(5, [[1, 0], [1, 2], [3, 4]]),
  [[1], [0, 2], [1], [4], [3]],
);
check(
  'duplicate roads stay visible in insertion order',
  () => buildStreetLedger(3, [[0, 1], [1, 0], [1, 2]]),
  [[1, 1], [0, 0, 2], [1]],
);
// ---End Tests

// ---Helpers
function check(desc: string, fn: () => unknown, expected: unknown): void {
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
