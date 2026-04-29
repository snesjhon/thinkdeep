// Goal: Practice launching one DFS per unclaimed district in an undirected graph.
//
// Return the number of connected components in the graph.
//
// Example:
//   countConnectedComponents(6, [[0,1],[1,2],[3,4]]) -> 3
//   countConnectedComponents(4, [[0,1],[1,2],[2,3]]) -> 1
type Edge = [number, number];

function countConnectedComponents(n: number, edges: Edge[]): number {
  if (n === 0) return 0;

  const graph = Array.from({ length: n }, () => [] as number[]);
  for (const [a, b] of edges) {
    graph[a].push(b);
    graph[b].push(a);
  }

  const visited = new Set<number>();

  function dfs(node: number): void {
    if (visited.has(node)) return;
    visited.add(node);

    for (const neighbor of graph[node]) {
      dfs(neighbor);
    }
  }

  let components = 0;
  for (let node = 0; node < n; node++) {
    if (visited.has(node)) continue;
    components++;
    dfs(node);
  }

  return components;
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
  const actual = fn();
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${pass ? 'PASS' : 'FAIL'} ${desc}`);
  if (!pass) {
    console.log(`  expected: ${JSON.stringify(expected)}`);
    console.log(`  received: ${JSON.stringify(actual)}`);
  }
}
// ---End Helpers
