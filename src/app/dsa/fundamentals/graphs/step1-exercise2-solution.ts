// Goal: Practice counting how many direct roads touch each intersection in the street ledger.
type Road = [number, number];

function countStreetConnections(n: number, roads: Road[]): number[] {
  const degrees = Array.from({ length: n }, () => 0);

  for (const [a, b] of roads) {
    degrees[a]++;
    degrees[b]++;
  }

  return degrees;
}

// ---Tests
check('empty graph gives all zero counts', () => countStreetConnections(3, []), [0, 0, 0]);
check('single road increments both endpoints', () => countStreetConnections(2, [[0, 1]]), [1, 1]);
check(
  'chain graph has expected degrees',
  () => countStreetConnections(4, [[0, 1], [1, 2], [2, 3]]),
  [1, 2, 2, 1],
);
check(
  'hub node counts every attached road',
  () => countStreetConnections(5, [[1, 0], [1, 2], [1, 3], [1, 4]]),
  [1, 4, 1, 1, 1],
);
check(
  'duplicate roads count as separate ledger entries',
  () => countStreetConnections(3, [[0, 1], [0, 1], [1, 2]]),
  [2, 3, 1],
);
// ---End Tests

// ---Helpers
function check(desc: string, fn: () => unknown, expected: unknown): void {
  const actual = fn();
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${pass ? 'PASS' : 'FAIL'} ${desc}`);
  if (!pass) {
    console.log(`  expected: ${JSON.stringify(expected)}`);
    console.log(`  received: ${JSON.stringify(actual)}`);
  }
}
// ---End Helpers
