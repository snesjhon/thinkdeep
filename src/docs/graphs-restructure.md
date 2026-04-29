# Graphs Section Restructure

## The Problem

`graphs/graphs-fundamentals.md` teaches BFS as its primary traversal technique, but the problems assigned to the Graphs step (200, 695, 133) are solved with DFS. `graph-traversal-dfs` has a `fundamentalsSlug` pointing to a guide that doesn't exist. `graph-traversal-bfs` has no `fundamentalsSlug` at all.

---

## Target Structure

### Sidebar: Graphs Fundamentals + DFS (two guides, one group)

**Guide 1 — Graphs Fundamentals** (`graphs` slug)
- What a graph is: node, edge, adjacency list, visited set, directed vs undirected, weighted vs unweighted, grid as implicit graph, connected components as a concept
- No traversal algorithm — traversal-agnostic exercises only (build an adjacency list, identify components by hand, recognize graph structure in a problem)
- No LeetCode problems in `journey.ts` — the guide's 9 exercises carry the step

**Guide 2 — Graphs DFS** (`graphs-dfs` slug)
- Mirrors the BFS guide in structure: Level 1 / Level 2 / Level 3 building blocks with exercises
- Level 1: Grid DFS — recursive flood fill, connects to tree recursion students already know
- Level 2: Adjacency-list DFS — general graphs, explicit recursion, visited tracking
- Level 3: Directed DFS — cycle detection via visited coloring (unvisited / in-progress / done)
- LeetCode problems follow the guide

**DFS problems** (move from `graphs` section to `graph-traversal-dfs`):
- firstPass: 200, 695 (grid DFS), 133 (adjacency-list DFS + hash map)
- reinforce: 547, 797, 207, 130, 417

---

### Sidebar: Graph Traversal — BFS (one guide, existing content)

**Guide — Graphs BFS** (`graphs-bfs` slug)
- Existing `graphs/graphs-fundamentals.md` content moved to `graphs-bfs/` — no rewrite
- BFS traces, connected components, Kahn's topological sort stay exactly as written
- `graph-traversal-bfs` in `journey.ts` gets `fundamentalsSlug: 'graphs-bfs'`

**BFS problems** (no change):
- firstPass: 1091, 994, 286
- reinforce: 127

---

## Current State vs Target State

| journey.ts section | Current | Target |
|---|---|---|
| `graphs` | fundamentalsSlug: `graphs` (BFS guide), problems: 200/695/133 | fundamentalsSlug: `graphs` (new pure concepts guide), no problems |
| `graph-traversal-dfs` | fundamentalsSlug: `graph-traversal-dfs` (guide missing), problems: 547/797/207 | fundamentalsSlug: `graphs-dfs` (new DFS guide), problems: 200/695/133/547/797/207/130/417 |
| `graph-traversal-bfs` | no fundamentalsSlug, problems: 1091/994/286 | fundamentalsSlug: `graphs-bfs` (moved existing guide), problems: 1091/994/286/127 |

---

## Migration Steps (in order)

**Step 1 — Preserve the existing BFS guide**

Copy the existing guide and its exercise files to the new `graphs-bfs` directory before anything overwrites them.

```bash
cp -r src/app/dsa/fundamentals/graphs src/app/dsa/fundamentals/graphs-bfs
mv src/app/dsa/fundamentals/graphs-bfs/graphs-fundamentals.md \
   src/app/dsa/fundamentals/graphs-bfs/graphs-bfs-fundamentals.md
```

**Step 2 — Wire `graphs-bfs` into journey.ts**

In the `graph-traversal-bfs` section, add:
```ts
fundamentalsSlug: 'graphs-bfs',
fundamentalsBlurb: 'BFS by layers, multi-source sweeps, and Kahn\'s topological sort — the three things a queue unlocks that recursion alone cannot.',
```

Also move `{ id: '127', isFirstPass: false, difficulty: 'hard' }` from wherever it lives into `graph-traversal-bfs` reinforce if not already there.

**Step 3 — Generate the pure Graphs Fundamentals guide**

```
/dsa-fundamentals Graphs
```

This overwrites `graphs/graphs-fundamentals.md` (now safely backed up). Brief the skill with:
- Focus: graph vocabulary and representation only — adjacency list construction, visited set purpose, directed vs undirected, weighted vs unweighted, grid as implicit graph, connected components as a concept
- No traversal algorithm in any exercise — exercises should be traversal-agnostic (build the adjacency list, identify whether nodes share an edge, count how many nodes a given component has by reading structure, not by running DFS or BFS)
- The guide explicitly signals at the end that DFS and BFS are two separate traversal strategies covered in the next steps

**Step 4 — Generate the Graphs DFS guide**

```
/dsa-fundamentals Graphs DFS
```

Brief the skill with:
- Slug: `graphs-dfs`, directory: `src/app/dsa/fundamentals/graphs-dfs/`
- Analogy: maze explorer — go as deep as possible, mark the path, backtrack when stuck
- Level 1: Grid DFS — recursive flood fill on a 2D grid, no adjacency list needed; this is tree recursion with 4 neighbors instead of 2; exercises: flood fill a cell, count reachable cells, measure area
- Level 2: Adjacency-list DFS — general graph, explicit recursion on the adjacency list, connected components; exercises: DFS from a start node, collect all reachable nodes, count components
- Level 3: Directed DFS with visited coloring (unvisited=0 / in-progress=1 / done=2) for cycle detection; exercises: detect a cycle, return the processing order, identify stuck nodes
- No BFS, no Kahn's — those live in the BFS guide

**Step 5 — Update journey.ts for graphs and graph-traversal-dfs**

`graphs` section: remove all `firstPass` and `reinforce` entries (no LeetCode problems — the guide exercises carry the step). Update `fundamentalsBlurb` to reflect the new pure-concepts scope.

`graph-traversal-dfs` section: update `fundamentalsSlug` to `graphs-dfs`. Move 200, 695, 133 into `firstPass` (ahead of 547, 797, 207). Update `fundamentalsBlurb`:
```ts
fundamentalsSlug: 'graphs-dfs',
fundamentalsBlurb: 'Recursive flood fill, adjacency-list DFS, and cycle detection via visited coloring — the three levels of depth DFS opens up.',
firstPass: [
  { id: '200', isFirstPass: true, difficulty: 'medium' },
  { id: '695', isFirstPass: true, difficulty: 'medium' },
  { id: '133', isFirstPass: true, difficulty: 'medium' },
  { id: '547', isFirstPass: true, difficulty: 'medium' },
  { id: '797', isFirstPass: true, difficulty: 'medium' },
  { id: '207', isFirstPass: true, difficulty: 'medium' },
],
reinforce: [
  { id: '130', isFirstPass: false, difficulty: 'medium' },
  { id: '417', isFirstPass: false, difficulty: 'medium' },
],
```

**Step 6 — Update `00-complete-dsa-path.md`**

See the path doc for the specific changes needed to Step 12 and Step 13 problem lists and revisit cross-references.

---

## What Does Not Change

- `graph-traversal-bfs` problems (1091, 994, 286, 127)
- `advanced-graphs` section — untouched
- All content inside the existing BFS guide — copied, not rewritten
- The three-section sidebar order: Fundamentals → DFS → BFS
