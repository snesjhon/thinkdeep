// Goal: Practice writing down rooms only after their outgoing corridors are fully cleared.
//
// Return the DFS finish order for a directed graph, appending each node when it becomes done.
//
// Example:
//   dfsFinishOrder([[1,2],[3],[3],[]]) -> [3,1,2,0]
//   dfsFinishOrder([[1],[],[3],[]])     -> [1,0,3,2]
function dfsFinishOrder(graph: number[][]): number[] {
  const colors = Array(graph.length).fill(0);
  const finish: number[] = [];

  function dfs(node: number): void {
    if (colors[node] !== 0) return;

    colors[node] = 1;
    for (const neighbor of graph[node]) {
      dfs(neighbor);
    }
    colors[node] = 2;
    finish.push(node);
  }

  for (let node = 0; node < graph.length; node++) {
    dfs(node);
  }

  return finish;
}

// ---Tests
test(
  'collects finish order from a connected DAG',
  () => dfsFinishOrder([[1, 2], [3], [3], []]),
  [3, 1, 2, 0],
);
test(
  'handles disconnected DAG pieces',
  () => dfsFinishOrder([[1], [], [3], []]),
  [1, 0, 3, 2],
);
test(
  'finishes a single isolated node',
  () => dfsFinishOrder([[]]),
  [0],
);
test(
  'keeps shared children from being appended twice',
  () => dfsFinishOrder([[1, 2], [3], [3], [4], []]),
  [4, 3, 1, 2, 0],
);
test(
  'returns an empty list for an empty graph',
  () => dfsFinishOrder([]),
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
