// Goal: Practice building the room map once, then exploring the reachable district with DFS.
//
// Build an undirected adjacency list from the edge list and return the reachable nodes from the start.
//
// Example:
//   reachableNodes(5, [[0,1],[0,2],[2,4],[3,4]], 0) -> [0,1,2,4,3]
//   reachableNodes(4, [[1,2]], 0)                   -> [0]
type UndirectedEdge = [number, number];

function reachableNodes(
  n: number,
  edges: UndirectedEdge[],
  start: number,
): number[] {
  throw new Error('not implemented');
}

// ---Tests
test(
  'builds the graph and returns reachable nodes in DFS order',
  () => reachableNodes(5, [[0, 1], [0, 2], [2, 4], [3, 4]], 0),
  [0, 1, 2, 4, 3],
);
test(
  'returns only the start node when it is isolated',
  () => reachableNodes(4, [[1, 2]], 0),
  [0],
);
test(
  'handles a graph with one long chain',
  () => reachableNodes(4, [[0, 1], [1, 2], [2, 3]], 1),
  [1, 0, 2, 3],
);
test(
  'does not revisit through undirected back edges',
  () => reachableNodes(4, [[0, 1], [1, 2], [2, 0], [2, 3]], 0),
  [0, 1, 2, 3],
);
test(
  'returns an empty array for an invalid start node',
  () => reachableNodes(3, [[0, 1]], 3),
  [],
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
