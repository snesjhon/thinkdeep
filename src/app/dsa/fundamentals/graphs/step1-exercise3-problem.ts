// Goal: Practice using the street ledger to answer which node pairs share a direct road.
//
// Build the undirected adjacency list once, then answer each query with true or false.
//
// Example:
//   directRoadLookup(4, [[0, 1], [0, 2], [2, 3]], [[0, 2], [1, 3]]) -> [true,false]
//   directRoadLookup(3, [], [[0, 1]])                               -> [false]
type Road = [number, number];
type Query = [number, number];

function directRoadLookup(n: number, roads: Road[], queries: Query[]): boolean[] {
  throw new Error('not implemented');
}

// ---Tests
check('empty graph answers false for every query', () => directRoadLookup(3, [], [[0, 1], [1, 2]]), [false, false]);
check(
  'returns true for existing direct roads',
  () => directRoadLookup(4, [[0, 1], [0, 2], [2, 3]], [[0, 2], [2, 3]]),
  [true, true],
);
check(
  'returns false when nodes only share an indirect path',
  () => directRoadLookup(4, [[0, 1], [1, 2], [2, 3]], [[0, 2], [1, 3]]),
  [false, false],
);
check(
  'symmetric queries stay true in an undirected graph',
  () => directRoadLookup(3, [[0, 1], [1, 2]], [[1, 0], [2, 1]]),
  [true, true],
);
check(
  'mixed query set preserves order',
  () => directRoadLookup(5, [[0, 4], [2, 3], [1, 4]], [[0, 4], [0, 1], [3, 2]]),
  [true, false, true],
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
