// Goal: Practice using the stamp sheet to keep only fresh neighbors the first time they appear.
function freshNeighbors(neighbors: number[], stamped: number[]): number[] {
  const seen = new Set(stamped);
  const fresh: number[] = [];

  for (const node of neighbors) {
    if (seen.has(node)) continue;
    seen.add(node);
    fresh.push(node);
  }

  return fresh;
}

// ---Tests
check('empty neighbor list stays empty', () => freshNeighbors([], []), []);
check('already stamped nodes are skipped', () => freshNeighbors([1, 2, 3], [2]), [1, 3]);
check('duplicate fresh arrivals only appear once', () => freshNeighbors([3, 4, 3, 5], [2]), [3, 4, 5]);
check('duplicates already stamped never reappear', () => freshNeighbors([1, 1, 2], [1]), [2]);
check('first fresh arrival stamps later duplicates in the same pass', () => freshNeighbors([4, 4, 4, 2, 2, 7], []), [4, 2, 7]);
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
