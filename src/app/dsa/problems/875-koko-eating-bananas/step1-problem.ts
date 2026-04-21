// Goal: Build a helper that tests whether a given eating k can finish
//       all piles within h hours.

function canFinishAtSpeed(piles: number[], h: number, k: number): boolean {
  throw new Error('not implemented');
}

// ---Tests
runCase('k 4 finishes [3,6,7,11] in exactly 8 hours', () => canFinishAtSpeed([3, 6, 7, 11], 8, 4), true);
runCase('k 3 needs 10 hours for [3,6,7,11], so it fails', () => canFinishAtSpeed([3, 6, 7, 11], 8, 3), false);
runCase('k equal to pile size clears uniform piles in n hours', () => canFinishAtSpeed([8, 8, 8, 8], 8, 8), true);
runCase('k 4 also works for uniform piles of 8 in 8 hours', () => canFinishAtSpeed([8, 8, 8, 8], 8, 4), true);
runCase('k 1 fails when total bananas exceed h', () => canFinishAtSpeed([5, 5, 5, 5], 4, 1), false);
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
