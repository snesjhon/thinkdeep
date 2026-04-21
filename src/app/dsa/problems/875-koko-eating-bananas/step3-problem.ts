// Goal: Use Binary Search over eating ks to return the minimum k that
//       clears every pile within h hours.

function canFinishAtSpeed(piles: number[], h: number, k: number): boolean {
  let hoursNeeded = 0;

  for (const pile of piles) {
    hoursNeeded += Math.ceil(pile / k);
  }

  return hoursNeeded <= h;
}

function minEatingSpeed(piles: number[], h: number): number {
  let left = 1;
  let right = Math.max(...piles);

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (canFinishAtSpeed(piles, h, mid)) {
      right = mid - 1;
    } else {
      throw new Error('not implemented');
    }
  }

  return left;
}

// ---Tests
runCase('single pile with one hour needs k 1', () => minEatingSpeed([1], 1), 1);
runCase('the first midpoint can already be the answer', () => minEatingSpeed([8, 8, 8, 8], 8), 4);
runCase('example 1: four piles in eight hours', () => minEatingSpeed([3, 6, 7, 11], 8), 4);
runCase('handles a high answer at the right edge', () => minEatingSpeed([30, 11, 23, 4, 20], 5), 30);
runCase('handles a mixed answer in the middle', () => minEatingSpeed([30, 11, 23, 4, 20], 6), 23);
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
