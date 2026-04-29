// Goal: Practice reading district tags so you can tell whether two intersections belong to the same component.
function sameDistrict(tags: number[], a: number, b: number): boolean {
  return tags[a] === tags[b];
}

// ---Tests
check('same node always shares its own district', () => sameDistrict([5, 2, 2], 1, 1), true);
check('matching tags mean same district', () => sameDistrict([7, 7, 3, 3, 3], 0, 1), true);
check('different tags mean different districts', () => sameDistrict([7, 7, 3, 3, 3], 0, 4), false);
check('isolated district label still compares normally', () => sameDistrict([4, 1, 9], 2, 2), true);
check('comparison works at both ends of the array', () => sameDistrict([8, 6, 6, 8], 0, 3), true);
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
