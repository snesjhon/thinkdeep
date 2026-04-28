// Goal: Guarantee stable identity for one node. Create exactly one copied
// intersection for each original node, and reuse it if the same node appears again.

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
  throw new Error('not implemented');
}

function cloneGraph(node: GraphNode | null): GraphNode | null {
  throw new Error('not implemented');
}

// Tests — all must print PASS
runCase(
  'creates one fresh copy with the same value and no shared identity',
  () => {
    const original = new GraphNode(7);
    const clones = new Map<GraphNode, GraphNode>();
    const copy = getOrCreateClone(original, clones);

    return {
      val: copy.val,
      neighbors: copy.neighbors.length,
      sameObject: copy === original,
      ledgerSize: clones.size,
    };
  },
  {
    val: 7,
    neighbors: 0,
    sameObject: false,
    ledgerSize: 1,
  },
);

runCase(
  'reuses the same copied node when the original is seen again',
  () => {
    const original = new GraphNode(3);
    const clones = new Map<GraphNode, GraphNode>();
    const first = getOrCreateClone(original, clones);
    const second = getOrCreateClone(original, clones);

    return {
      sameCopy: first === second,
      ledgerSize: clones.size,
      copiedValue: second.val,
    };
  },
  {
    sameCopy: true,
    ledgerSize: 1,
    copiedValue: 3,
  },
);

// ---Helpers
function runCase(desc: string, fn: () => unknown, expected: unknown): void {
  const actual = fn();
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${pass ? 'PASS' : 'FAIL'} ${desc}`);
  if (!pass) {
    console.log(`  expected: ${JSON.stringify(expected)}`);
    console.log(`  received: ${JSON.stringify(actual)}`);
  }
}
// ---End Helpers
