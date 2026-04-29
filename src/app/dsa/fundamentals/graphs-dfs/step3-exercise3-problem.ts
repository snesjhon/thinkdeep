// Goal: Practice returning the exact loop of rooms that keeps the rope from finishing.
//
// The graph contains exactly one directed cycle. Return the nodes on that cycle in cycle order.
//
// Example:
//   extractDirectedCycle([[1],[2],[3],[1]]) -> [1,2,3]
//   extractDirectedCycle([[1],[2],[0,3],[]]) -> [0,1,2]
function extractDirectedCycle(graph: number[][]): number[] {
  throw new Error('not implemented');
}

// ---Tests
test(
  'extracts a simple three-node cycle',
  () => extractDirectedCycle([[1], [2], [3], [1]]),
  [1, 2, 3],
);
test(
  'extracts a cycle that starts at node zero',
  () => extractDirectedCycle([[1], [2], [0, 3], []]),
  [0, 1, 2],
);
test(
  'returns a one-node cycle for a self loop',
  () => extractDirectedCycle([[0], [2], []]),
  [0],
);
test(
  'ignores acyclic prefixes before the cycle begins',
  () => extractDirectedCycle([[1], [2], [3], [4], [2]]),
  [2, 3, 4],
);
test(
  'extracts the only cycle in a disconnected graph',
  () => extractDirectedCycle([[1], [], [3], [4], [2]]),
  [2, 3, 4],
);
// ---End Tests

// ---Helpers
function test(desc: string, fn: () => unknown, expected: unknown): void {
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
