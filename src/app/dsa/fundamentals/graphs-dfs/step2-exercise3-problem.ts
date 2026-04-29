// Goal: Practice launching one DFS per unclaimed district in an undirected graph.
//
// Return the number of connected components in the graph.
//
// Example:
//   countConnectedComponents(6, [[0,1],[1,2],[3,4]]) -> 3
//   countConnectedComponents(4, [[0,1],[1,2],[2,3]]) -> 1
type Edge = [number, number];

function countConnectedComponents(n: number, edges: Edge[]): number {
  throw new Error('not implemented');
}

// ---Tests
test(
  'counts multiple components including an isolated node',
  () => countConnectedComponents(6, [[0, 1], [1, 2], [3, 4]]),
  3,
);
test(
  'returns one for a fully connected chain',
  () => countConnectedComponents(4, [[0, 1], [1, 2], [2, 3]]),
  1,
);
test(
  'returns n when there are no edges',
  () => countConnectedComponents(3, []),
  3,
);
test(
  'handles repeated edges without changing the component count',
  () => countConnectedComponents(4, [[0, 1], [1, 0], [2, 3]]),
  2,
);
test(
  'returns zero for an empty graph',
  () => countConnectedComponents(0, []),
  0,
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
