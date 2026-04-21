// Goal: Set up the Binary Search over the speed range. Find the midpoint,
//       test it with canFinishAtSpeed, and return mid if it works.

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
      return mid;
    } else {
      throw new Error('not implemented');
    }
  }

  return -1;
}

// ---Tests
runCase('single pile in one hour needs speed 1', () => minEatingSpeed([1], 1), 1);
runCase('midpoint lands exactly on the answer', () => minEatingSpeed([8, 8, 8, 8], 8), 4);
runCase('midpoint lands exactly on the answer with tens', () => minEatingSpeed([10, 10, 10, 10], 8), 5);
runCase('midpoint lands exactly on the answer with fours', () => minEatingSpeed([4, 4, 4, 4], 8), 2);
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
