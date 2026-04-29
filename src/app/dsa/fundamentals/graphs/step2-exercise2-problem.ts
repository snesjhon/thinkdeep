// Goal: Practice writing toll entries so each outgoing road keeps both destination and cost.
//
// Build a directed weighted adjacency list in insertion order.
//
// Example:
//   buildTollLedger(4, [[0, 1, 5], [0, 2, 2], [2, 3, 7]]) -> [[{to:1,weight:5},{to:2,weight:2}],[],[{to:3,weight:7}],[]]
//   buildTollLedger(3, [])                                 -> [[],[],[]]
type WeightedArrow = [number, number, number];
type Toll = { to: number; weight: number };

function buildTollLedger(n: number, arrows: WeightedArrow[]): Toll[][] {
  throw new Error('not implemented');
}

// ---Tests
check('empty toll graph keeps empty ledgers', () => buildTollLedger(3, []), [[], [], []]);
check(
  'stores one weighted entry for one arrow',
  () => buildTollLedger(2, [[0, 1, 5]]),
  [[{ to: 1, weight: 5 }], []],
);
check(
  'multiple outgoing toll roads keep insertion order',
  () => buildTollLedger(4, [[0, 1, 5], [0, 2, 2], [2, 3, 7]]),
  [[{ to: 1, weight: 5 }, { to: 2, weight: 2 }], [], [{ to: 3, weight: 7 }], []],
);
check(
  'incoming-only node still gets empty bucket',
  () => buildTollLedger(4, [[1, 0, 3], [2, 0, 4]]),
  [[], [{ to: 0, weight: 3 }], [{ to: 0, weight: 4 }], []],
);
check(
  'same destination can appear with different costs',
  () => buildTollLedger(3, [[0, 1, 5], [0, 1, 8], [1, 2, 1]]),
  [[{ to: 1, weight: 5 }, { to: 1, weight: 8 }], [{ to: 2, weight: 1 }], []],
);
// ---End Tests

// ---Helpers
function check(desc: string, fn: () => unknown, expected: unknown): void {
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
