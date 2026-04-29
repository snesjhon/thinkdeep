// Goal: Practice spotting when the explorer's rope loops back onto a gray room.
//
// Return true if the directed graph contains any cycle, using colors 0, 1, and 2.
//
// Example:
//   hasDirectedCycle([[1],[2],[1],[]]) -> true
//   hasDirectedCycle([[1,2],[3],[3],[]]) -> false
function hasDirectedCycle(graph: number[][]): boolean {
  const colors = Array(graph.length).fill(0);

  function dfs(node: number): boolean {
    if (colors[node] === 1) return true;
    if (colors[node] === 2) return false;

    colors[node] = 1;
    for (const neighbor of graph[node]) {
      if (dfs(neighbor)) return true;
    }

    colors[node] = 2;
    return false;
  }

  for (let node = 0; node < graph.length; node++) {
    if (colors[node] === 0 && dfs(node)) {
      return true;
    }
  }

  return false;
}

// ---Tests
test(
  'detects a simple directed cycle',
  () => hasDirectedCycle([[1], [2], [1], []]),
  true,
);
test(
  'returns false for a directed acyclic graph',
  () => hasDirectedCycle([[1, 2], [3], [3], []]),
  false,
);
test(
  'detects a self loop as a cycle',
  () => hasDirectedCycle([[0], []]),
  true,
);
test(
  'handles disconnected pieces when one piece has a cycle',
  () => hasDirectedCycle([[1], [], [3], [4], [2]]),
  true,
);
test(
  'returns false for an empty graph',
  () => hasDirectedCycle([]),
  false,
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
