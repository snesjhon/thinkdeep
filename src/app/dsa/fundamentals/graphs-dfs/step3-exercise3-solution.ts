// Goal: Practice returning the exact loop of rooms that keeps the rope from finishing.
//
// The graph contains exactly one directed cycle. Return the nodes on that cycle in cycle order.
//
// Example:
//   extractDirectedCycle([[1],[2],[3],[1]]) -> [1,2,3]
//   extractDirectedCycle([[1],[2],[0,3],[]]) -> [0,1,2]
function extractDirectedCycle(graph: number[][]): number[] {
  const colors = Array(graph.length).fill(0);
  const path: number[] = [];
  const indexByNode = new Map<number, number>();

  function dfs(node: number): number[] | null {
    colors[node] = 1;
    indexByNode.set(node, path.length);
    path.push(node);

    for (const neighbor of graph[node]) {
      if (colors[neighbor] === 0) {
        const cycle = dfs(neighbor);
        if (cycle) return cycle;
      } else if (colors[neighbor] === 1) {
        const startIndex = indexByNode.get(neighbor)!;
        return path.slice(startIndex);
      }
    }

    path.pop();
    indexByNode.delete(node);
    colors[node] = 2;
    return null;
  }

  for (let node = 0; node < graph.length; node++) {
    if (colors[node] !== 0) continue;
    const cycle = dfs(node);
    if (cycle) return cycle;
  }

  return [];
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
  const actual = fn();
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${pass ? 'PASS' : 'FAIL'} ${desc}`);
  if (!pass) {
    console.log(`  expected: ${JSON.stringify(expected)}`);
    console.log(`  received: ${JSON.stringify(actual)}`);
  }
}
// ---End Helpers
