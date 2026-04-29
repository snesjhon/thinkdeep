// Goal: Practice reading district tags so you can count how many intersections belong to one component.
function districtSize(tags: number[], node: number): number {
  const targetTag = tags[node];
  let size = 0;

  for (const tag of tags) {
    if (tag === targetTag) size++;
  }

  return size;
}

// ---Tests
check('single-node district has size one', () => districtSize([2, 5, 9], 1), 1);
check('counts every node with the same district tag', () => districtSize([7, 7, 3, 3, 3], 4), 3);
check('works for the first district in the array', () => districtSize([4, 4, 4, 9], 0), 3);
check('works for a target at the end of the array', () => districtSize([8, 6, 6, 8], 3), 2);
check('all nodes in one district count together', () => districtSize([1, 1, 1, 1], 2), 4);
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
