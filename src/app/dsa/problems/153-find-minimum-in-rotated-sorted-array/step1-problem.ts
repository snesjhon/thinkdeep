// Goal: Set the live shelf boundaries and return immediately when that
//       window is already sorted from left to right.

function findMin(nums: number[]): number {
  throw new Error('not implemented');
}

// ---Tests
runCase('single book is already the minimum', () => findMin([7]), 7);
runCase('already sorted shelf returns the first book', () => findMin([11, 13, 15, 17]), 11);
runCase('two-book sorted shelf returns the leftmost value', () => findMin([2, 5]), 2);
runCase('sorted negative shelf still returns the first value', () => findMin([-9, -4, -1]), -9);
// ---End Tests

// ---Helpers
function runCase(desc: string, fn: () => unknown, expected: unknown): void {
  try {
    const actual = fn();
    const pass = JSON.stringify(actual) === JSON.stringify(expected);
    console.log(`${pass ? 'PASS' : 'FAIL'} ${desc}`);
    if (!pass) {
      console.log(`  expected: ${JSON.stringify(expected)}`);
      console.log(`  received: ${JSON.stringify(actual)}`);
    }
  } catch (e) {
    if (e instanceof Error && e.message === 'not implemented') {
      console.log(`TODO  ${desc}`);
    } else {
      throw e;
    }
  }
}
// ---End Helpers
