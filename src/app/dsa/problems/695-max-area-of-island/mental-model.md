# Max Area of Island - Mental Model

## The Problem

You are given an `m x n` binary matrix `grid`. An island is a group of `1`s, representing land, connected horizontally or vertically. You may assume all four edges of the grid are surrounded by water.

The area of an island is the number of cells with value `1` in the island.

Return the maximum area of an island in `grid`. If there is no island, return `0`.

**Example 1:**

```text
Input: grid = [
  [0,0,1,0,0,0,0,1,0,0,0,0,0],
  [0,0,0,0,0,0,0,1,1,1,0,0,0],
  [0,1,1,0,1,0,0,0,0,0,0,0,0],
  [1,0,0,0,1,0,0,0,1,0,1,0,0],
  [1,0,0,0,1,1,0,0,1,1,1,0,0],
  [0,0,0,0,0,0,0,0,0,0,1,0,0],
  [0,0,0,0,0,0,0,1,1,1,0,0,0],
  [0,0,0,0,0,0,0,1,1,0,0,0,0]
]
Output: 6
```

**Example 2:**

```text
Input: grid = [[0,0,0,0,0,0,0,0]]
Output: 0
```

**Constraints:**

- `m == grid.length`
- `n == grid[i].length`
- `1 <= m, n <= 50`
- `grid[i][j]` is either `0` or `1`

## The Analogy: Measure One Shoreline Before Comparing It

### What are we actually searching for?

We are not trying to count all land squares in the whole map at once. We are trying to measure one connected shoreline at a time, then remember the biggest measurement we have seen.

That changes the job. The moment I step onto a land square, the important question is no longer "is this land?" It becomes "how large is the whole island connected to this square?"

### The ranger's measuring walk

Imagine a park ranger flying over a chain of islands with a bundle of survey flags. Every time the ranger lands on fresh land, they walk that entire connected shoreline, dropping one flag on each land square they visit.

The flags do two jobs at once. First, each new flag adds one more unit to this island's area. Second, a flagged square is finished work, so the ranger never measures that square twice.

### How we define one shoreline

One shoreline is a connected patch of land reached by walking only up, down, left, or right. Diagonal touching does not count, because the ranger cannot step across corners without passing through water.

So each land square has exactly four meaningful directions to continue the walk:

- up
- down
- left
- right

### The property that makes DFS valid

Once the ranger steps onto one square of an island, depth-first search is just a committed measuring walk. Follow one path of land as far as it goes, mark that ground as finished, then backtrack and try the next path.

That works because every square in one island is reachable by repeating those four side steps from some other square in the same island. If I mark a square the moment I measure it, then the only remaining useful work is unvisited neighboring land.

### Testing one starting square

When I test a square, there are only three meaningful outcomes:

- it is off the map, so it contributes `0` area
- it is water, so it contributes `0` area
- it is fresh land, so it contributes `1` for itself and may lead to more land around it

That is the whole measuring idea. Every valid land square contributes one unit for itself, then asks its four neighbors whether they also belong to the same shoreline.

### How I Think Through This

I think of the DFS helper as "measure the island starting from this square." If the square is useless, off the map or already water, the answer is `0`. If it is fresh land, then I already know this island has at least area `1` because I am standing on one real square.

From there I mark that square immediately, then I ask the same measuring question in the four allowed directions. Their returned areas belong to the same shoreline, so I add them onto my current `1`. The outer scan does not need to understand island shape, it only needs to compare finished island sizes and keep the largest one.

Take
`grid = [[1,1,0],[1,0,1]]`.

:::trace-graph
[
  {
    "nodes": [
      {"id":"a","label":"1","x":20,"y":28,"tone":"current","badge":"start"},
      {"id":"b","label":"1","x":50,"y":28,"tone":"frontier"},
      {"id":"c","label":"0","x":80,"y":28,"tone":"blocked"},
      {"id":"d","label":"1","x":20,"y":72,"tone":"frontier"},
      {"id":"e","label":"0","x":50,"y":72,"tone":"blocked"},
      {"id":"f","label":"1","x":80,"y":72,"tone":"default","badge":"separate"}
    ],
    "edges": [
      {"from":"a","to":"b","tone":"active"},
      {"from":"a","to":"d","tone":"active"}
    ],
    "facts": [
      {"name":"probe", "value":"(0,0)", "tone":"blue"},
      {"name":"starting area", "value":1, "tone":"green"}
    ],
    "action":"mark",
    "label":"The first fresh land square already contributes area 1 for itself, and its side neighbors are the only places this shoreline can continue."
  },
  {
    "nodes": [
      {"id":"a","label":"0","x":20,"y":28,"tone":"done"},
      {"id":"b","label":"0","x":50,"y":28,"tone":"done"},
      {"id":"c","label":"0","x":80,"y":28,"tone":"blocked"},
      {"id":"d","label":"0","x":20,"y":72,"tone":"done"},
      {"id":"e","label":"0","x":50,"y":72,"tone":"blocked"},
      {"id":"f","label":"1","x":80,"y":72,"tone":"default","badge":"still separate"}
    ],
    "edges": [
      {"from":"a","to":"b","tone":"traversed"},
      {"from":"a","to":"d","tone":"traversed"}
    ],
    "facts": [
      {"name":"measured area", "value":3, "tone":"green"},
      {"name":"remaining island", "value":"(1,2)", "tone":"orange"}
    ],
    "action":"done",
    "label":"After the DFS returns, that whole shoreline has been measured as area 3, and any untouched land must belong to a different island."
  }
]
:::

---

## Building the Algorithm

### Step 1: Teach One Land Square to Contribute Area 1

Start with the smallest real measurement rule. If the coordinates are off the map, or the square is water, this branch contributes no area. If the square is land, mark it visited and return `1`.

That single `1` is the foundation of the whole solution. It says, "this square belongs to the island I am measuring, so it counts once." Do not recurse yet. First make one square contribute its own area correctly.

:::trace-graph
[
  {
    "nodes": [
      {"id":"a","label":"1","x":35,"y":50,"tone":"current","badge":"count me"},
      {"id":"b","label":"0","x":65,"y":50,"tone":"blocked"}
    ],
    "edges": [],
    "facts": [
      {"name":"cell", "value":"fresh land", "tone":"blue"}
    ],
    "action":"mark",
    "label":"Step 1 teaches the local rule: one valid land square contributes area 1 and is marked immediately."
  },
  {
    "nodes": [
      {"id":"a","label":"0","x":35,"y":50,"tone":"done","badge":"measured"},
      {"id":"b","label":"0","x":65,"y":50,"tone":"blocked"}
    ],
    "edges": [],
    "facts": [
      {"name":"returned area", "value":1, "tone":"green"}
    ],
    "action":"done",
    "label":"After the flip, this square is finished work and cannot add area again later."
  }
]
:::

:::stackblitz{file="step1-problem.ts" step=1 total=3 solution="step1-solution.ts"}

<details>
  <summary>Hints & gotchas</summary>

- **Zero means no shoreline here**: off-map and water both return `0`.
- **Count the current square before anything else**: fresh land already proves one unit of area.
- **Mark immediately**: once this square contributes, it must never contribute again.
</details>

### Step 2: Add the Four-Direction Area from the Rest of the Shoreline

Now finish the DFS helper. After marking the current land square, the helper should ask the four side neighbors how much additional area they contribute to the same island.

This is where recursion becomes a measuring tool instead of just a traversal tool. The current square contributes `1`, and each recursive call returns extra area from one direction. Add those results together, and the helper returns the full area of the connected shoreline.

:::trace-graph
[
  {
    "nodes": [
      {"id":"a","label":"1","x":20,"y":28,"tone":"current"},
      {"id":"b","label":"1","x":50,"y":28,"tone":"frontier"},
      {"id":"c","label":"0","x":80,"y":28,"tone":"blocked"},
      {"id":"d","label":"1","x":20,"y":72,"tone":"frontier"},
      {"id":"e","label":"1","x":50,"y":72,"tone":"frontier"},
      {"id":"f","label":"0","x":80,"y":72,"tone":"blocked"}
    ],
    "edges": [
      {"from":"a","to":"b","tone":"active"},
      {"from":"a","to":"d","tone":"active"},
      {"from":"b","to":"e","tone":"queued"},
      {"from":"d","to":"e","tone":"queued"}
    ],
    "facts": [
      {"name":"current area", "value":"1 so far", "tone":"blue"},
      {"name":"next work", "value":"add 4 neighbor returns", "tone":"orange"}
    ],
    "action":"expand",
    "label":"Step 2 grows the local rule into a full shoreline measurement by summing the four recursive directions."
  },
  {
    "nodes": [
      {"id":"a","label":"0","x":20,"y":28,"tone":"done"},
      {"id":"b","label":"0","x":50,"y":28,"tone":"done"},
      {"id":"c","label":"0","x":80,"y":28,"tone":"blocked"},
      {"id":"d","label":"0","x":20,"y":72,"tone":"done"},
      {"id":"e","label":"0","x":50,"y":72,"tone":"done"},
      {"id":"f","label":"0","x":80,"y":72,"tone":"blocked"}
    ],
    "edges": [
      {"from":"a","to":"b","tone":"traversed"},
      {"from":"a","to":"d","tone":"traversed"},
      {"from":"b","to":"e","tone":"traversed"},
      {"from":"d","to":"e","tone":"traversed"}
    ],
    "facts": [
      {"name":"returned area", "value":4, "tone":"green"}
    ],
    "action":"done",
    "label":"When the helper returns, it has measured the entire connected island and summed every land square exactly once."
  }
]
:::

:::stackblitz{file="step2-problem.ts" step=2 total=3 solution="step2-solution.ts"}

<details>
  <summary>Hints & gotchas</summary>

- **Only four directions count**: diagonals must stay out of the sum.
- **The current square is part of the total**: the recursive work adds onto an existing `1`, it does not replace it.
- **Mutation is the visited set**: the `0` flip prevents cycles and double counting.
</details>

### Step 3: Scan Every Starting Point and Keep the Largest Island

With the helper complete, the outer function becomes a comparison loop. Walk the whole grid. Whenever you find fresh land, measure that entire island by calling the helper, then compare its returned area against the best answer so far.

The helper turns one starting square into one finished island area. The outer scan only has to remember the maximum. Once an island has been measured, its squares have already been flipped to `0`, so later scan positions from that island cannot compete again.

:::trace-graph
[
  {
    "nodes": [
      {"id":"a","label":"1","x":15,"y":25,"tone":"current","badge":"area 3"},
      {"id":"b","label":"1","x":35,"y":25,"tone":"frontier"},
      {"id":"c","label":"0","x":55,"y":25,"tone":"blocked"},
      {"id":"d","label":"0","x":75,"y":25,"tone":"blocked"},
      {"id":"e","label":"1","x":15,"y":55,"tone":"frontier"},
      {"id":"f","label":"0","x":35,"y":55,"tone":"blocked"},
      {"id":"g","label":"1","x":55,"y":55,"tone":"default","badge":"later area 4"},
      {"id":"h","label":"1","x":75,"y":55,"tone":"default"},
      {"id":"i","label":"0","x":15,"y":85,"tone":"blocked"},
      {"id":"j","label":"1","x":35,"y":85,"tone":"default"},
      {"id":"k","label":"1","x":55,"y":85,"tone":"default"},
      {"id":"l","label":"0","x":75,"y":85,"tone":"blocked"}
    ],
    "edges": [
      {"from":"a","to":"b","tone":"active"},
      {"from":"a","to":"e","tone":"active"},
      {"from":"g","to":"h","tone":"muted"},
      {"from":"g","to":"k","tone":"muted"},
      {"from":"j","to":"k","tone":"muted"}
    ],
    "facts": [
      {"name":"measured area", "value":3, "tone":"green"},
      {"name":"best so far", "value":3, "tone":"blue"}
    ],
    "action":"mark",
    "label":"The scan measures one island completely, then stores that finished area as the current maximum."
  },
  {
    "nodes": [
      {"id":"a","label":"0","x":15,"y":25,"tone":"done"},
      {"id":"b","label":"0","x":35,"y":25,"tone":"done"},
      {"id":"c","label":"0","x":55,"y":25,"tone":"blocked"},
      {"id":"d","label":"0","x":75,"y":25,"tone":"blocked"},
      {"id":"e","label":"0","x":15,"y":55,"tone":"done"},
      {"id":"f","label":"0","x":35,"y":55,"tone":"blocked"},
      {"id":"g","label":"0","x":55,"y":55,"tone":"done"},
      {"id":"h","label":"0","x":75,"y":55,"tone":"done"},
      {"id":"i","label":"0","x":15,"y":85,"tone":"blocked"},
      {"id":"j","label":"0","x":35,"y":85,"tone":"done"},
      {"id":"k","label":"0","x":55,"y":85,"tone":"done"},
      {"id":"l","label":"0","x":75,"y":85,"tone":"blocked"}
    ],
    "edges": [
      {"from":"g","to":"h","tone":"traversed"},
      {"from":"g","to":"k","tone":"traversed"},
      {"from":"j","to":"k","tone":"traversed"}
    ],
    "facts": [
      {"name":"new area", "value":4, "tone":"green"},
      {"name":"best answer", "value":4, "tone":"green"}
    ],
    "action":"done",
    "label":"When a later island measures larger, the maximum updates. The final answer is the largest finished shoreline area seen anywhere in the grid."
  }
]
:::

:::stackblitz{file="step3-problem.ts" step=3 total=3 solution="step3-solution.ts"}

<details>
  <summary>Hints & gotchas</summary>

- **Measure before comparing**: the helper returns one complete island area at a time.
- **Reuse the DFS helper exactly as built**: the outer function should compare areas, not re-measure inside its own logic.
- **If there is no land, the maximum should stay `0`**: no helper call ever beats the starting answer.
</details>

## Tracing through an Example

Take
`grid = [[1,1,0,0],[1,0,0,1],[0,1,1,1]]`.

:::trace-graph
[
  {
    "nodes": [
      {"id":"a","label":"1","x":15,"y":20,"tone":"current"},
      {"id":"b","label":"1","x":35,"y":20,"tone":"frontier"},
      {"id":"c","label":"0","x":55,"y":20,"tone":"blocked"},
      {"id":"d","label":"0","x":75,"y":20,"tone":"blocked"},
      {"id":"e","label":"1","x":15,"y":50,"tone":"frontier"},
      {"id":"f","label":"0","x":35,"y":50,"tone":"blocked"},
      {"id":"g","label":"0","x":55,"y":50,"tone":"blocked"},
      {"id":"h","label":"1","x":75,"y":50,"tone":"default"},
      {"id":"i","label":"0","x":15,"y":80,"tone":"blocked"},
      {"id":"j","label":"1","x":35,"y":80,"tone":"default"},
      {"id":"k","label":"1","x":55,"y":80,"tone":"default"},
      {"id":"l","label":"1","x":75,"y":80,"tone":"default"}
    ],
    "edges": [
      {"from":"a","to":"b","tone":"active"},
      {"from":"a","to":"e","tone":"active"},
      {"from":"h","to":"l","tone":"muted"},
      {"from":"j","to":"k","tone":"muted"},
      {"from":"k","to":"l","tone":"muted"}
    ],
    "facts": [
      {"name":"measured area", "value":3, "tone":"green"},
      {"name":"best so far", "value":3, "tone":"blue"}
    ],
    "action":"expand",
    "label":"The scan starts at `(0,0)` and measures the top-left island as area 3."
  },
  {
    "nodes": [
      {"id":"a","label":"0","x":15,"y":20,"tone":"done"},
      {"id":"b","label":"0","x":35,"y":20,"tone":"done"},
      {"id":"c","label":"0","x":55,"y":20,"tone":"blocked"},
      {"id":"d","label":"0","x":75,"y":20,"tone":"blocked"},
      {"id":"e","label":"0","x":15,"y":50,"tone":"done"},
      {"id":"f","label":"0","x":35,"y":50,"tone":"blocked"},
      {"id":"g","label":"0","x":55,"y":50,"tone":"blocked"},
      {"id":"h","label":"1","x":75,"y":50,"tone":"current"},
      {"id":"i","label":"0","x":15,"y":80,"tone":"blocked"},
      {"id":"j","label":"1","x":35,"y":80,"tone":"frontier"},
      {"id":"k","label":"1","x":55,"y":80,"tone":"frontier"},
      {"id":"l","label":"1","x":75,"y":80,"tone":"frontier"}
    ],
    "edges": [
      {"from":"h","to":"l","tone":"active"},
      {"from":"j","to":"k","tone":"active"},
      {"from":"k","to":"l","tone":"active"}
    ],
    "facts": [
      {"name":"next island area", "value":4, "tone":"green"},
      {"name":"best so far", "value":4, "tone":"green"}
    ],
    "action":"mark",
    "label":"Later the scan reaches `(1,3)` and measures the bottom-right island as area 4, which becomes the new maximum."
  },
  {
    "nodes": [
      {"id":"a","label":"0","x":15,"y":20,"tone":"done"},
      {"id":"b","label":"0","x":35,"y":20,"tone":"done"},
      {"id":"c","label":"0","x":55,"y":20,"tone":"blocked"},
      {"id":"d","label":"0","x":75,"y":20,"tone":"blocked"},
      {"id":"e","label":"0","x":15,"y":50,"tone":"done"},
      {"id":"f","label":"0","x":35,"y":50,"tone":"blocked"},
      {"id":"g","label":"0","x":55,"y":50,"tone":"blocked"},
      {"id":"h","label":"0","x":75,"y":50,"tone":"done"},
      {"id":"i","label":"0","x":15,"y":80,"tone":"blocked"},
      {"id":"j","label":"0","x":35,"y":80,"tone":"done"},
      {"id":"k","label":"0","x":55,"y":80,"tone":"done"},
      {"id":"l","label":"0","x":75,"y":80,"tone":"done"}
    ],
    "edges": [
      {"from":"h","to":"l","tone":"traversed"},
      {"from":"j","to":"k","tone":"traversed"},
      {"from":"k","to":"l","tone":"traversed"}
    ],
    "facts": [
      {"name":"final answer", "value":4, "tone":"green"}
    ],
    "action":"done",
    "label":"After both islands are measured and erased, the largest area seen anywhere in the grid is 4."
  }
]
:::

## Recognizing This Pattern

- Reach for this pattern when the input is a grid or map and the real job is to measure one connected region at a time.
- The structural property is connectivity: once one square in a region is found, repeated side-adjacent moves can reach every other square in that same island.
- DFS flood fill beats restarting local counts from every land square because each cell is processed at most once, and each helper call finishes an entire connected component.

## Complete Solution

:::stackblitz{file="solution.ts" step=3 total=3 solution="solution.ts"}
