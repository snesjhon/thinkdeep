// Goal: Practice writing the one-way flight board so only outgoing arrows appear in each ledger.
type Arrow = [number, number];

function buildArrowLedger(n: number, arrows: Arrow[]): number[][] {
  const ledger = Array.from({ length: n }, () => [] as number[]);

  for (const [from, to] of arrows) {
    ledger[from].push(to);
  }

  return ledger;
}

// ---Tests
check('empty directed graph keeps empty ledgers', () => buildArrowLedger(3, []), [[], [], []]);
check('single arrow updates only the source node', () => buildArrowLedger(2, [[0, 1]]), [[1], []]);
check(
  'multiple outgoing arrows stay grouped by source',
  () => buildArrowLedger(4, [[0, 1], [0, 2], [2, 3]]),
  [[1, 2], [], [3], []],
);
check(
  'node with only incoming arrows still has empty outgoing bucket',
  () => buildArrowLedger(4, [[1, 0], [2, 0], [3, 0]]),
  [[], [0], [0], [0]],
);
check(
  'duplicate arrows remain in insertion order',
  () => buildArrowLedger(3, [[0, 1], [0, 1], [1, 2]]),
  [[1, 1], [2], []],
);
// ---End Tests

// ---Helpers
function check(desc: string, fn: () => unknown, expected: unknown): void {
  const actual = fn();
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${pass ? 'PASS' : 'FAIL'} ${desc}`);
  if (!pass) {
    console.log(`  expected: ${JSON.stringify(expected)}`);
    console.log(`  received: ${JSON.stringify(actual)}`);
  }
}
// ---End Helpers
