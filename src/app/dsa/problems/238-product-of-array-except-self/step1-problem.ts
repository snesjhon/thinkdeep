// Goal: Walk left to right and let the left messenger write each locker's
//       left-side product onto the answer tags.

function productExceptSelf(nums: number[]): number[] {
  throw new Error('not implemented');
}

// ---Tests
runCase('empty hallway', () => productExceptSelf([]), []);
runCase('single locker has no left side', () => productExceptSelf([5]), [1]);
runCase('forward tags for [1,2,3,4]', () => productExceptSelf([1, 2, 3, 4]), [1, 1, 2, 6]);
runCase('forward tags for [2,3,4,5]', () => productExceptSelf([2, 3, 4, 5]), [1, 2, 6, 24]);
runCase('zero affects later left bundles', () => productExceptSelf([2, 0, 4, 5]), [1, 2, 0, 0]);
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
