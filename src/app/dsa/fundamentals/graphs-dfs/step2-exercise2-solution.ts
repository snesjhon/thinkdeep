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
  if (start < 0 || start >= n) return [];

  const graph = Array.from({ length: n }, () => [] as number[]);
  for (const [a, b] of edges) {
    graph[a].push(b);
    graph[b].push(a);
  }

  const visited = new Set<number>();
  const order: number[] = [];

  function dfs(node: number): void {
    if (visited.has(node)) return;
    visited.add(node);
    order.push(node);

    for (const neighbor of graph[node]) {
      dfs(neighbor);
    }
  }

  dfs(start);
  return order;
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
  const actual = fn();
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${pass ? 'PASS' : 'FAIL'} ${desc}`);
  if (!pass) {
    console.log(`  expected: ${JSON.stringify(expected)}`);
    console.log(`  received: ${JSON.stringify(actual)}`);
  }
}
// ---End Helpers
