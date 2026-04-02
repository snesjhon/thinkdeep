// =============================================================================
// 146. LRU Cache — Step 1 of 2 Solution
// =============================================================================
// Goal: Build the shelf rails and the ledger so boxes can be inserted,
// updated, and found without ever scanning the row.

// ---Helpers

class ShelfNode {
  key: number;
  value: number;
  warmer: ShelfNode | null = null;
  colder: ShelfNode | null = null;

  constructor(key: number, value: number) {
    this.key = key;
    this.value = value;
  }
}

// ---End Helpers

class LRUCache {
  private readonly capacity: number;
  private readonly boxesByLabel = new Map<number, ShelfNode>();
  private readonly hotGate = new ShelfNode(-1, -1);
  private readonly coldGate = new ShelfNode(-1, -1);

  constructor(capacity: number) {
    this.capacity = capacity;
    this.hotGate.colder = this.coldGate;
    this.coldGate.warmer = this.hotGate;
  }

  private removeBox(box: ShelfNode): void {
    const warmerBox = box.warmer!;
    const colderBox = box.colder!;
    warmerBox.colder = colderBox;
    colderBox.warmer = warmerBox;
  }

  private addBoxToHotShelf(box: ShelfNode): void {
    const firstWarmBox = this.hotGate.colder!;
    box.warmer = this.hotGate;
    box.colder = firstWarmBox;
    this.hotGate.colder = box;
    firstWarmBox.warmer = box;
  }

  get(key: number): number {
    const box = this.boxesByLabel.get(key); // open the ledger and grab the exact box
    if (!box) return -1; // no ledger entry means no such box on the shelf

    this.removeBox(box); // lift the box from its current slot
    this.addBoxToHotShelf(box); // reheat it by clipping it beside the hot gate
    return box.value;
  }

  put(key: number, value: number): void {
    const existingBox = this.boxesByLabel.get(key);

    if (existingBox) {
      existingBox.value = value; // rewrite the contents of the same physical box
      this.removeBox(existingBox); // unclip the old position
      this.addBoxToHotShelf(existingBox); // snap it back onto the hot end
      return;
    }

    const freshBox = new ShelfNode(key, value); // build a new labeled box
    this.boxesByLabel.set(key, freshBox); // ledger now points straight to it
    this.addBoxToHotShelf(freshBox); // new arrivals are hottest immediately
  }
}

runCase('missing label returns -1', () => {
  const cache = new LRUCache(2);
  return cache.get(99);
}, -1);

runCase('new box can be read back while under capacity', () => {
  const cache = new LRUCache(2);
  cache.put(1, 10);
  return cache.get(1);
}, 10);

runCase('updating the same label changes the stored value', () => {
  const cache = new LRUCache(2);
  cache.put(1, 10);
  cache.put(1, 15);
  return cache.get(1);
}, 15);

runCase('multiple labels can coexist while shelf has room', () => {
  const cache = new LRUCache(3);
  cache.put(1, 10);
  cache.put(2, 20);
  return [cache.get(1), cache.get(2)];
}, [10, 20]);

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
