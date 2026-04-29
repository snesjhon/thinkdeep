// Goal: Practice using the stamp sheet to keep only fresh neighbors the first time they appear.
//
// Return the neighbors that are not already stamped and do not repeat after their first fresh appearance.
//
// Example:
//   freshNeighbors([3, 4, 3, 5], [2]) -> [3,4,5]
//   freshNeighbors([1, 1, 2], [1])    -> [2]
function freshNeighbors(neighbors: number[], stamped: number[]): number[] {
  throw new Error('not implemented');
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
