// =============================================================================
// 146. LRU Cache — Step 2 of 2 Solution
// =============================================================================
// Goal: Reheat every touched box and evict the coldest box when the shelf
// overflows.

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
    const box = this.boxesByLabel.get(key); // open the ledger
    if (!box) return -1; // absent label means no box to reheat

    this.removeBox(box); // lift the touched box out of line
    this.addBoxToHotShelf(box); // touched boxes always return beside the hot gate
    return box.value;
  }

  put(key: number, value: number): void {
    const existingBox = this.boxesByLabel.get(key);

    if (existingBox) {
      existingBox.value = value; // rewrite the contents in place
      this.removeBox(existingBox); // unclip the old position
      this.addBoxToHotShelf(existingBox); // updated boxes become hottest again
      return;
    }

    const freshBox = new ShelfNode(key, value); // assemble the new box
    this.boxesByLabel.set(key, freshBox); // add its label to the ledger
    this.addBoxToHotShelf(freshBox); // every arrival starts on the hot end

    if (this.boxesByLabel.size > this.capacity) {
      const coldestBox = this.coldGate.warmer!; // the box by the cold gate is least recently used
      this.boxesByLabel.delete(coldestBox.key); // erase that label from the ledger
      this.removeBox(coldestBox); // lift the cold box off the shelf
    }
  }
}

runCase('example sequence from the prompt', () => {
  const cache = new LRUCache(2);
  cache.put(1, 1);
  cache.put(2, 2);
  const firstRead = cache.get(1);
  cache.put(3, 3);
  const secondRead = cache.get(2);
  cache.put(4, 4);
  return [firstRead, secondRead, cache.get(1), cache.get(3), cache.get(4)];
}, [1, -1, -1, 3, 4]);

runCase('updating an existing label keeps it hot', () => {
  const cache = new LRUCache(2);
  cache.put(2, 1);
  cache.put(2, 2);
  cache.put(1, 1);
  cache.put(4, 1);
  return [cache.get(2), cache.get(1), cache.get(4)];
}, [-1, 1, 1]);

runCase('a get can change the later eviction target', () => {
  const cache = new LRUCache(2);
  cache.put(1, 10);
  cache.put(2, 20);
  cache.get(1);
  cache.put(3, 30);
  return [cache.get(1), cache.get(2), cache.get(3)];
}, [10, -1, 30]);

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
