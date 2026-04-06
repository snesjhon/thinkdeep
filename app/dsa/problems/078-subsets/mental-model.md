# Subsets - Mental Model

## The Problem

Given an integer array `nums` of **unique** elements, return all possible subsets (the power set).

The solution set must not contain duplicate subsets. Return the solution in **any order**.

**Example 1:**
```
Input: nums = [1,2,3]
Output: [[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]
```

**Example 2:**
```
Input: nums = [0]
Output: [[],[0]]
```

**Constraints:**
- `1 <= nums.length <= 10`
- `-10 <= nums[i] <= 10`
- All the numbers of `nums` are unique.

---

## The Vending Machine Analogy

Imagine a vending machine with numbered slots in a single row: slot 0, slot 1, slot 2, and so on. Each slot holds one snack. You are standing in front of it with an empty basket, and your task is to collect every possible combination of snacks that this machine could ever give you — including the combination where you take nothing at all.

The rule is simple: at each slot you face a binary choice — grab that snack and drop it in your basket, or walk past it. After you decide, you move to the next slot and face the same choice again. When you've passed all the slots, you write down exactly what's in your basket (that's one complete subset) and then retrace your steps to try the choices you haven't explored yet.

The magic is in the retracing. After you've explored every path that starts with grabbing the snack in a given slot, you put that snack back on the shelf and try every path where you skip it instead. This is backtracking — make a choice, explore all consequences, undo it, try the alternative. By the time you've fully retraced back to the entrance, you've visited every possible combination exactly once.

One critical observation: you write down your basket's contents at the start of each slot visit, not just when you reach the end. Every intermediate basket is already a valid subset. The empty basket at the very entrance is the empty subset `[]`. The basket after grabbing slot 0 only is the subset `[nums[0]]`. You record them all.

## Understanding the Analogy

### The Setup

You arrive at the vending machine with an empty basket. The machine has `n` slots numbered 0 through `n-1`. You will stand in front of each slot in order, but the key insight is that you don't always start at slot 0 — after grabbing a snack, you move to the next slot, so you only ever consider slots at or after your current position. This prevents you from grabbing the same snack twice and avoids counting the same combination in different orders.

### The Basket and the Decision

At each slot, you face exactly two choices. Choice one: reach in, grab `nums[slot]`, drop it in your basket, then advance to the next slot and keep exploring. Choice two: leave the slot untouched and move to the next one without adding anything. Either way, before you make this choice you have already written down your basket contents — every time you arrive at a slot, whatever is in your basket at that moment is a valid subset.

The slot index you're currently examining is called `start`. Every recursive call begins by recording the basket, then loops over slots from `start` to the last slot, trying each one.

### The Retracing

After you fully explore every path that begins by grabbing the snack at slot `i` (meaning you've drilled all the way down and recorded all subsets that include `nums[i]` as their next element), you put `nums[i]` back on the shelf. Your basket returns to exactly the state it was before you grabbed it. Then the loop advances to slot `i+1` and you try grabbing from there instead.

This undo step — `basket.pop()` — is what makes the algorithm correct. Without it, baskets from one exploration branch would contaminate the next branch.

### Why This Approach

Why not generate subsets mathematically using bitmasks? Bitmasks work, but they obscure the structure: you lose the natural "I'm currently standing at slot X with these items" mental model that makes backtracking generalize to harder problems. The vending machine walk is the same mental model you'll use for permutations, combinations, and N-Queens — the only difference is what constraints you add to the choice at each slot.

Why record the basket at every slot visit rather than only at the end? Because every prefix of a selection is itself a valid subset. The backtracking tree has 2ⁿ leaves, but there are 2ⁿ valid subsets in total — and they correspond exactly to the basket contents at each node in the tree, not just the leaves.

## How I Think Through This

Before any slot is visited, I push a snapshot of `basket` into `results`. Starting with an empty basket, that immediately records `[]` as the first subset. Then I enter a loop from `start` to the end of `nums`.

On each iteration of that loop, I grab `nums[i]` — push it onto `basket` — then call the same function recursively with `start = i + 1`. That recursive call will immediately record the current basket again (now containing this new snack), loop over the remaining slots, and so on. When the recursion returns, I put the snack back: `basket.pop()`. This restores the basket to its pre-grab state, and the loop advances to the next slot.

The stopping condition is implicit: when `start` equals `nums.length`, the for-loop body never runs. The basket snapshot still gets recorded (it's a complete subset, just one with no further choices), and the function returns. No explicit base case is needed.

Because `basket` is shared and mutated in place across every recursive call, it must be declared once in the outer `subsets` function — not recreated on each backtrack call. `results` lives there too, and both are closed over by `backtrack`. The outer function initializes them, calls `backtrack(0)`, and returns `results`.

Take `nums = [1, 2, 3]`.

:::trace-subset
[
  {"nums":[1,2,3],"start":0,"basket":[],"action":"record","label":"Arrived at slot 0. Basket is empty — record [] as the first subset. Now loop from slot 0."},
  {"nums":[1,2,3],"start":0,"basket":[1],"action":"add","label":"Grab slot 0 (1) → basket = [1]. Recurse with start=1."},
  {"nums":[1,2,3],"start":1,"basket":[1],"action":"record","label":"Arrived at slot 1 with basket [1] — record [1]. Now loop from slot 1."},
  {"nums":[1,2,3],"start":1,"basket":[1,2],"action":"add","label":"Grab slot 1 (2) → basket = [1,2]. Recurse with start=2."},
  {"nums":[1,2,3],"start":2,"basket":[1,2],"action":"record","label":"Arrived at slot 2 with basket [1,2] — record [1,2]. Now loop from slot 2."},
  {"nums":[1,2,3],"start":2,"basket":[1,2,3],"action":"add","label":"Grab slot 2 (3) → basket = [1,2,3]. Recurse with start=3."},
  {"nums":[1,2,3],"start":3,"basket":[1,2,3],"action":"record","label":"start=3 = nums.length. Record [1,2,3]. Loop never runs. Return."},
  {"nums":[1,2,3],"start":2,"basket":[1,2],"action":"remove","label":"Back at slot 2. Put 3 back → basket = [1,2]. Loop ends. Return."},
  {"nums":[1,2,3],"start":1,"basket":[1],"action":"remove","label":"Back at slot 1. Put 2 back → basket = [1]. Advance to slot 2."},
  {"nums":[1,2,3],"start":2,"basket":[1,3],"action":"add","label":"Grab slot 2 (3) → basket = [1,3]. Recurse with start=3."},
  {"nums":[1,2,3],"start":3,"basket":[1,3],"action":"record","label":"start=3 = nums.length. Record [1,3]. Return."},
  {"nums":[1,2,3],"start":2,"basket":[1],"action":"remove","label":"Back at slot 2. Put 3 back → basket = [1]. Loop ends. Return."},
  {"nums":[1,2,3],"start":0,"basket":[],"action":"remove","label":"Back at slot 0. Put 1 back → basket = []. Advance to slot 1."},
  {"nums":[1,2,3],"start":1,"basket":[2],"action":"add","label":"Grab slot 1 (2) → basket = [2]. Recurse with start=2."},
  {"nums":[1,2,3],"start":2,"basket":[2],"action":"record","label":"Arrived at slot 2 with basket [2] — record [2]. Now loop from slot 2."},
  {"nums":[1,2,3],"start":2,"basket":[2,3],"action":"add","label":"Grab slot 2 (3) → basket = [2,3]. Recurse with start=3."},
  {"nums":[1,2,3],"start":3,"basket":[2,3],"action":"record","label":"start=3 = nums.length. Record [2,3]. Return."},
  {"nums":[1,2,3],"start":2,"basket":[2],"action":"remove","label":"Back at slot 2. Put 3 back → basket = [2]. Loop ends. Return."},
  {"nums":[1,2,3],"start":1,"basket":[],"action":"remove","label":"Back at slot 1. Put 2 back → basket = []. Advance to slot 2."},
  {"nums":[1,2,3],"start":2,"basket":[3],"action":"add","label":"Grab slot 2 (3) → basket = [3]. Recurse with start=3."},
  {"nums":[1,2,3],"start":3,"basket":[3],"action":"record","label":"start=3 = nums.length. Record [3]. Return."},
  {"nums":[1,2,3],"start":2,"basket":[],"action":"remove","label":"Back at slot 2. Put 3 back → basket = []. Loop ends. Return."},
  {"nums":[1,2,3],"start":3,"basket":[],"action":"done","label":"All slots visited. Results: [[], [1], [1,2], [1,2,3], [1,3], [2], [2,3], [3]] — all 8 subsets. ✓"}
]
:::

## Building the Algorithm

Each step introduces one concept from the Vending Machine analogy, then a StackBlitz embed to try it.

### Step 1: Arrive, Record, Prepare to Walk

The first thing that happens at every slot visit — before any grabbing — is writing down whatever is in the basket. This is the recording step, and it happens unconditionally, even when the basket is empty.

`subsets(nums)` is the outer shell: it creates `results` and `basket` once, defines `backtrack` as a closure over both, calls `backtrack(0)`, and returns `results`. Both arrays persist across every recursive call because `backtrack` closes over them — no argument passing needed.

Inside `backtrack(start)`, the very first line records `[...basket]` into `results`. The spread operator is required — `results.push(basket)` would store the same reference that gets mutated later, so every entry in `results` would end up as an empty array by the time the traversal finishes.

After recording, a `for` loop runs from `start` to `nums.length - 1`. The loop body will be filled in the next step. For now, having the loop header in place is enough to prove the recording invariant: every call to `backtrack` contributes exactly one entry to `results`, regardless of what the loop eventually does.

:::trace-subset
[
  {"nums":[1,2,3],"start":0,"basket":[],"action":"record","label":"backtrack(0): record [] immediately. results = [[]]"},
  {"nums":[1,2,3],"start":1,"basket":[],"action":"record","label":"If called with start=1, empty basket: record []. results grows by one entry each call."},
  {"nums":[1,2,3],"start":3,"basket":[1,2,3],"action":"record","label":"start=3 (past last slot): record [1,2,3]. Loop runs 0 times. Returns immediately."}
]
:::

:::stackblitz{file="step1-problem.ts" step=1 total=2 solution="step1-solution.ts"}

<details>
<summary>Hints</summary>

- Declare `results` and `basket` inside `subsets`, before defining `backtrack`. They live for the entire traversal.
- `results.push(basket)` stores a live reference — the basket will be empty by the time the traversal finishes. Use `results.push([...basket])` to capture a snapshot.
- When `start === nums.length`, the for-loop body never executes, but the record still happens. No explicit `if` guard is needed.
- The loop header `for (let i = start; i < nums.length; i++) {}` is the full loop for this step — leave the body empty.

</details>

### Step 2: Grab the Snack, Explore, Put It Back

Now fill in the loop body. For each slot `i` from `start` to `nums.length - 1`:

1. **Grab** — push `nums[i]` onto `basket`.
2. **Explore** — call `backtrack(i + 1)`. This recursive call immediately records the new basket state and explores every slot after `i`.
3. **Put back** — pop the last element off `basket`.

Step 3 is not optional. `basket` is the same array object for the entire traversal, mutated in place. After exploring all paths that start with `nums[i]` in the basket, you must restore the basket to its pre-grab state before the loop advances to `i + 1`. Without the pop, `nums[i]` contaminates every basket recorded in subsequent branches.

The advance to `i + 1` (not `i`) in the recursive call is equally critical. Calling `backtrack(i)` would re-examine the same slot, adding `nums[i]` to the basket forever and stack-overflowing immediately.

:::trace-subset
[
  {"nums":[1,2,3],"start":0,"basket":[],"action":"record","label":"record []. Loop i=0: grab nums[0]=1."},
  {"nums":[1,2,3],"start":0,"basket":[1],"action":"add","label":"basket.push(1) → [1]. Call backtrack(1)."},
  {"nums":[1,2,3],"start":1,"basket":[1],"action":"record","label":"record [1]. Loop i=1: grab nums[1]=2."},
  {"nums":[1,2,3],"start":1,"basket":[1,2],"action":"add","label":"basket.push(2) → [1,2]. Call backtrack(2)."},
  {"nums":[1,2,3],"start":2,"basket":[1,2],"action":"record","label":"record [1,2]. Loop i=2: grab nums[2]=3."},
  {"nums":[1,2,3],"start":2,"basket":[1,2,3],"action":"add","label":"basket.push(3) → [1,2,3]. Call backtrack(3)."},
  {"nums":[1,2,3],"start":3,"basket":[1,2,3],"action":"record","label":"record [1,2,3]. Loop runs 0 times. Return."},
  {"nums":[1,2,3],"start":2,"basket":[1,2],"action":"remove","label":"basket.pop() → [1,2]. i=2 was last slot. Return."},
  {"nums":[1,2,3],"start":1,"basket":[1],"action":"remove","label":"basket.pop() → [1]. Advance i to 2."}
]
:::

:::stackblitz{file="step2-problem.ts" step=2 total=2 solution="step2-solution.ts"}

<details>
<summary>Hints</summary>

- Push before the recursive call, pop immediately after — always paired, never separated by a conditional.
- `backtrack(i + 1)` not `backtrack(i)` — you must advance past the current slot.
- The pop runs after `backtrack` returns, regardless of how deep the recursion went. It always restores the basket to exactly the state before the push.

</details>

---

## Common Misconceptions

**"I should only record the basket when `start === nums.length` (at the end of each path)"** — That would only collect the leaves of the backtracking tree, which are the longest subsets reachable from each starting branch. You'd miss `[]`, `[1]`, `[2]`, `[1,2]`, and many others. Every node in the tree — not just the leaves — holds a valid subset. Record at every arrival.

**"I don't need to pop after the recursive call — the recursion handles cleanup"** — The recursion does not reset the basket. `basket` is a shared array mutated in place throughout the entire traversal. After you grab snack `nums[i]` and explore everything downstream, you must put it back with `basket.pop()` before trying `nums[i+1]`. Without the pop, `nums[i]` stays in the basket for every remaining branch.

**"I should push `basket` directly into results, not a copy"** — `basket` is the same array object for the entire traversal. Pushing it directly means every entry in `results` is the same reference, and they'll all reflect the final state of `basket` when the traversal ends — which is empty. Always spread: `results.push([...basket])`.

**"Passing `i` instead of `i + 1` to the recursive call is fine"** — If you call `backtrack(i)` after grabbing `nums[i]`, the recursion will immediately try to grab `nums[i]` again — leading to a stack overflow. You must advance to `i + 1` to tell the machine to only consider slots ahead of the one just grabbed.

**"I need to sort `nums` first for the backtracking to work correctly"** — Sorting is required for problems with duplicate elements (like LeetCode 90, Subsets II), where you need to skip duplicate choices at the same decision level. For problem 78, all elements are unique. Backtracking works in any order; sorting is irrelevant here.

## Complete Solution

:::stackblitz{file="solution.ts" step=2 total=2 solution="solution.ts"}
