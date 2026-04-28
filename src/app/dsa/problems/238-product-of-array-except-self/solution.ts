// Goal: Build each locker tag in two passes, first by storing the left-side
//       product, then by multiplying in the right-side product.

function productExceptSelf(nums: number[]): number[] {
  const answer = new Array(nums.length).fill(1);

  let prefix = 1;
  for (let i = 0; i < nums.length; i += 1) {
    answer[i] = prefix;
    prefix *= nums[i];
  }

  let suffix = 1;
  for (let i = nums.length - 1; i >= 0; i -= 1) {
    answer[i] *= suffix;
    suffix *= nums[i];
  }

  return answer;
}

// ---Tests
runCase('empty hallway', () => productExceptSelf([]), []);
runCase('single locker', () => productExceptSelf([5]), [1]);
runCase('example 1', () => productExceptSelf([1, 2, 3, 4]), [24, 12, 8, 6]);
runCase('example 2 with zero', () => productExceptSelf([-1, 1, 0, -3, 3]), [0, 0, 9, 0, 0]);
runCase('all positive', () => productExceptSelf([2, 3, 4, 5]), [60, 40, 30, 24]);
runCase('two zeros wipe every tag', () => productExceptSelf([0, 4, 0]), [0, 0, 0]);
runCase('single zero only helps one locker', () => productExceptSelf([2, 0, 4, 5]), [0, 40, 0, 0]);
runCase('negatives without zero', () => productExceptSelf([-2, 3, -4]), [-12, 8, -6]);
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
