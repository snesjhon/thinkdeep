// Goal: Complete solution. Give every original intersection exactly one copied
// intersection, then use DFS to translate every road into the cloned graph.

// ---Helpers
class GraphNode {
  val: number;
  neighbors: GraphNode[];

  constructor(val = 0, neighbors: GraphNode[] = []) {
    this.val = val;
    this.neighbors = neighbors;
  }
}
// ---End Helpers

function getOrCreateClone(node: GraphNode, clones: Map<GraphNode, GraphNode>): GraphNode {
  const existingCopy = clones.get(node);
  if (existingCopy !== undefined) return existingCopy;

  const copy = new GraphNode(node.val);
  clones.set(node, copy);
  return copy;
}

function cloneConnectedGraph(node: GraphNode, clones: Map<GraphNode, GraphNode>): GraphNode {
  if (clones.has(node)) return clones.get(node)!;

  const copy = getOrCreateClone(node, clones);

  for (const neighbor of node.neighbors) {
    copy.neighbors.push(cloneConnectedGraph(neighbor, clones));
  }

  return copy;
}

function cloneGraph(node: GraphNode | null): GraphNode | null {
  if (node === null) return null;

  return cloneConnectedGraph(node, new Map<GraphNode, GraphNode>());
}

// Tests — all must print PASS
runCloneCase(
  'empty graph stays empty',
  [],
  [],
);

runCloneCase(
  'single node stays isolated',
  [[]],
  [[]],
);

runCloneCase(
  'two connected nodes keep both directions',
  [[2], [1]],
  [[2], [1]],
);

runCloneCase(
  'prompt example keeps the four-node cycle shape',
  [[2, 4], [1, 3], [2, 4], [1, 3]],
  [[2, 4], [1, 3], [2, 4], [1, 3]],
);

runCloneCase(
  'triangle graph keeps all shared neighbors',
  [[2, 3], [1, 3], [1, 2]],
  [[2, 3], [1, 3], [1, 2]],
);

runMutationCase(
  'mutating the original after cloning does not mutate the copy',
  [[2, 3], [1], [1]],
);

// ---Helpers
function buildGraph(adjList: number[][]): GraphNode | null {
  if (adjList.length === 0) return null;

  const nodes = adjList.map((_, index) => new GraphNode(index + 1));

  for (let i = 0; i < adjList.length; i += 1) {
    nodes[i].neighbors = adjList[i].map((neighborVal) => nodes[neighborVal - 1]);
  }

  return nodes[0];
}

function collectGraph(start: GraphNode | null): GraphNode[] {
  if (start === null) return [];

  const queue: GraphNode[] = [start];
  const seen = new Set<GraphNode>([start]);
  const ordered: GraphNode[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    ordered.push(current);

    for (const neighbor of current.neighbors) {
      if (seen.has(neighbor)) continue;
      seen.add(neighbor);
      queue.push(neighbor);
    }
  }

  return ordered;
}

function inspectClone(original: GraphNode | null, clone: GraphNode | null): {
  adjList: number[][];
  sharesOriginalNodes: boolean;
  neighborEscapesClone: boolean;
} {
  const originalNodes = collectGraph(original);
  const cloneNodes = collectGraph(clone).sort((a, b) => a.val - b.val);
  const originalSet = new Set(originalNodes);
  const cloneSet = new Set(cloneNodes);

  return {
    adjList: cloneNodes.map((node) => node.neighbors.map((neighbor) => neighbor.val)),
    sharesOriginalNodes: cloneNodes.some((node) => originalSet.has(node)),
    neighborEscapesClone: cloneNodes.some((node) =>
      node.neighbors.some((neighbor) => !cloneSet.has(neighbor))),
  };
}

function runCloneCase(desc: string, input: number[][], expectedAdjList: number[][]): void {
  const original = buildGraph(input);
  const clone = cloneGraph(original);

  const actual = inspectClone(original, clone);
  const expected = {
    adjList: expectedAdjList,
    sharesOriginalNodes: false,
    neighborEscapesClone: false,
  };

  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${pass ? 'PASS' : 'FAIL'} ${desc}`);
  if (!pass) {
    console.log(`  expected: ${JSON.stringify(expected)}`);
    console.log(`  received: ${JSON.stringify(actual)}`);
  }
}

function runMutationCase(desc: string, input: number[][]): void {
  const original = buildGraph(input);
  const clone = cloneGraph(original);

  if (original !== null) {
    original.val = 99;
    original.neighbors = [];
  }

  const actual = inspectClone(original, clone);
  const expected = {
    adjList: input,
    sharesOriginalNodes: false,
    neighborEscapesClone: false,
  };

  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${pass ? 'PASS' : 'FAIL'} ${desc}`);
  if (!pass) {
    console.log(`  expected: ${JSON.stringify(expected)}`);
    console.log(`  received: ${JSON.stringify(actual)}`);
  }
}
// ---End Helpers
