// Goal: Keep the stable identity rule from step 1, then use DFS to copy every
// road in one connected component by translating neighbors through the ledger.

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
  throw new Error('not implemented');
}

function cloneGraph(node: GraphNode | null): GraphNode | null {
  throw new Error('not implemented');
}

// ---Tests
runCloneCase(
  'clones a single isolated intersection',
  [[]],
  [[]],
);

runCloneCase(
  'clones a two-way road without sharing original nodes',
  [[2], [1]],
  [[2], [1]],
);

runCloneCase(
  'clones a cycle by reusing copied intersections from the ledger',
  [[2, 4], [1, 3], [2, 4], [1, 3]],
  [[2, 4], [1, 3], [2, 4], [1, 3]],
);
// ---End Tests

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
  try {
    const original = buildGraph(input);
    const clone =
      original === null ? null : cloneConnectedGraph(original, new Map<GraphNode, GraphNode>());

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
  } catch (error) {
    if (error instanceof Error && error.message === 'not implemented') {
      console.log(`TODO  ${desc}`);
    } else {
      throw error;
    }
  }
}
// ---End Helpers
