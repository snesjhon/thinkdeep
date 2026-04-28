# Clone Graph - Mental Model

## The Problem

Given a reference of a node in a connected undirected graph, return a deep copy of the graph.

Each node in the graph contains a value (`val`) and a list (`neighbors`) of its neighbors.

```text
class Node {
    public int val;
    public List<Node> neighbors;
}
```

The graph is shown in the test case using an adjacency list.

An adjacency list is a collection of unordered lists used to represent a finite graph. Each list describes the set of neighbors of a node in the graph.

The given node will always be the first node with `val = 1`. You must return the copy of the given node as a reference to the cloned graph.

**Example 1:**

```text
Input: adjList = [[2,4],[1,3],[2,4],[1,3]]
Output: [[2,4],[1,3],[2,4],[1,3]]
```

**Example 2:**

```text
Input: adjList = [[]]
Output: [[]]
```

**Example 3:**

```text
Input: adjList = []
Output: []
```

## The Analogy: Rebuild the City Without Reusing Any Intersections

### What are we actually cloning?

We are not copying one value at a time. We are copying a whole street map.

Each intersection has two jobs:

- it stores its own street number
- it points to every road leading to neighboring intersections

That means a correct copy has to preserve both identity and relationships. A new intersection with the right number is still wrong if its roads point back into the old city.

### The survey desk ledger

Imagine a city survey team rebuilding an old neighborhood on fresh land. Every time they arrive at an old intersection, they need exactly one new intersection to represent it in the new city.

So the survey desk keeps a ledger:

- old intersection -> new intersection

That ledger is the whole strategy. Without it, the team could reach the same old intersection through two different roads and accidentally build two different copies of it. With the ledger, the moment they see an old intersection again, they know whether its replacement already exists.

### Why one ledger entry per intersection matters

Graphs can loop back on themselves. If road 1 leads to 2, and 2 leads back to 1, then "just keep copying neighbors" is not safe by itself. You need a moment where you say, "this old intersection already owns that new intersection, so reuse it."

That is why the ledger entry must be written as soon as a new intersection is created, not after all its roads are processed. The early entry breaks cycles. The next time the traversal comes back to the same old intersection, the answer is already waiting in the ledger.

### The property that makes DFS valid

Depth-first search fits because every road from the current intersection asks the same question:

- have I already built the copy of that neighboring intersection?
- if not, build it and keep exploring from there
- either way, connect the current copied intersection to the neighbor's copied intersection

DFS is just the natural way to finish one road network before backing up to the previous junction. The ledger keeps that deep walk safe even when the city map contains cycles.

### Testing one road from an intersection

When I stand on one old intersection, each outgoing road leads to one neighboring intersection in the old city. My job is to translate that road into the new city.

There are only two possibilities:

- the neighboring intersection has never been rebuilt, so I must build it now
- the neighboring intersection already has a rebuilt copy, so I simply reuse that copy

Either way, the current copied intersection should end up with a road to the neighbor's copied intersection, never to the old one.

### How I Think Through This

I treat the first seen intersection as the front door into the old city and open a blank ledger beside it. The first real move is not "copy every road." It is "make sure this old intersection owns exactly one new intersection in the ledger."

Once that ownership exists, every road becomes manageable. For each neighbor, I ask for that neighbor's copied intersection. If the ledger already has it, I reuse it. If not, I recurse, let that deeper call build it, and then come back with the correct copied neighbor. That keeps the new city connected without ever pointing back into the old one.

Take `adjList = [[2,4],[1,3],[2,4],[1,3]]`.

:::trace-graph
[
  {
    "nodes": [
      {"id":"1","label":"1","x":50,"y":15,"tone":"current","badge":"start"},
      {"id":"2","label":"2","x":85,"y":50,"tone":"frontier"},
      {"id":"3","label":"3","x":50,"y":85,"tone":"default"},
      {"id":"4","label":"4","x":15,"y":50,"tone":"frontier"}
    ],
    "edges": [
      {"from":"1","to":"2","tone":"active"},
      {"from":"1","to":"4","tone":"active"},
      {"from":"2","to":"3","tone":"default"},
      {"from":"3","to":"4","tone":"default"}
    ],
    "facts": [
      {"name":"ledger", "value":"empty", "tone":"orange"},
      {"name":"job", "value":"create copy of 1", "tone":"blue"}
    ],
    "action":"mark",
    "label":"The first move is to create exactly one copied intersection for node 1 and record it in the ledger before exploring any roads."
  },
  {
    "nodes": [
      {"id":"1","label":"1","x":50,"y":15,"tone":"done","badge":"copied"},
      {"id":"2","label":"2","x":85,"y":50,"tone":"frontier"},
      {"id":"3","label":"3","x":50,"y":85,"tone":"default"},
      {"id":"4","label":"4","x":15,"y":50,"tone":"frontier"}
    ],
    "edges": [
      {"from":"1","to":"2","tone":"queued"},
      {"from":"1","to":"4","tone":"queued"},
      {"from":"2","to":"3","tone":"default"},
      {"from":"3","to":"4","tone":"default"}
    ],
    "facts": [
      {"name":"ledger", "value":"1 -> copy(1)", "tone":"green"},
      {"name":"next roads", "value":"to 2 and 4", "tone":"blue"}
    ],
    "action":"done",
    "label":"Once node 1 owns a copied intersection, its roads can safely ask for copied neighbors one by one."
  }
]
:::

---

## Building the Algorithm

### Step 1: Give One Old Intersection Exactly One Copy

Start with the smallest invariant that makes the whole problem possible: one old intersection should map to exactly one new intersection.

That means the helper first checks the ledger. If a copy already exists, reuse it. If not, create a fresh copied intersection with the same value, store it in the ledger immediately, and return it. This step does not build roads yet. It only guarantees stable identity.

:::trace-graph
[
  {
    "nodes": [
      {"id":"1","label":"1","x":50,"y":20,"tone":"current","badge":"old"},
      {"id":"1c","label":"1'","x":50,"y":75,"tone":"default","badge":"new"}
    ],
    "edges": [],
    "facts": [
      {"name":"ledger before", "value":"missing 1", "tone":"orange"}
    ],
    "action":"mark",
    "label":"Step 1 teaches the ownership rule. If node 1 is not in the ledger yet, create one fresh copied intersection for it."
  },
  {
    "nodes": [
      {"id":"1","label":"1","x":50,"y":20,"tone":"done","badge":"recorded"},
      {"id":"1c","label":"1'","x":50,"y":75,"tone":"answer","badge":"copy"}
    ],
    "edges": [],
    "facts": [
      {"name":"ledger after", "value":"1 -> 1'", "tone":"green"}
    ],
    "action":"done",
    "label":"Now every later road that reaches old node 1 can reuse the same copied intersection instead of creating a duplicate."
  }
]
:::

:::stackblitz{file="step1-problem.ts" step=1 total=3 solution="step1-solution.ts"}

<details>
  <summary>Hints & gotchas</summary>

  - **Store the copy immediately**: cycles become safe only after the ledger already knows this node.
  - **Reuse, do not duplicate**: if the old intersection is already in the ledger, return that same copied intersection.
  - **This step is only identity**: do not wire neighbor roads yet.
</details>

### Step 2: Walk the Roads and Reuse the Ledger

Now turn one copied intersection into a copied connected component. After claiming the current old intersection's copy, walk through its neighbor list. For each neighboring old intersection, recursively ask for that neighbor's copied intersection, then attach the returned copy to the current copied intersection's neighbor list.

This is the moment DFS becomes the working engine. One road may lead to a fresh part of the city, or it may loop back to a place already rebuilt. The ledger handles both cases with the same interface.

:::trace-graph
[
  {
    "nodes": [
      {"id":"1","label":"1","x":50,"y":15,"tone":"current"},
      {"id":"2","label":"2","x":85,"y":50,"tone":"frontier"},
      {"id":"3","label":"3","x":50,"y":85,"tone":"default"},
      {"id":"4","label":"4","x":15,"y":50,"tone":"frontier"}
    ],
    "edges": [
      {"from":"1","to":"2","tone":"active"},
      {"from":"1","to":"4","tone":"queued"},
      {"from":"2","to":"3","tone":"default"},
      {"from":"3","to":"4","tone":"default"}
    ],
    "facts": [
      {"name":"current copy", "value":"copy(1)", "tone":"blue"},
      {"name":"next road", "value":"1 -> 2", "tone":"orange"}
    ],
    "action":"expand",
    "label":"Step 2 adds the recursive road walk. The current copied intersection asks DFS to deliver the copied version of each neighbor."
  },
  {
    "nodes": [
      {"id":"1","label":"1","x":50,"y":15,"tone":"done"},
      {"id":"2","label":"2","x":85,"y":50,"tone":"done"},
      {"id":"3","label":"3","x":50,"y":85,"tone":"frontier"},
      {"id":"4","label":"4","x":15,"y":50,"tone":"frontier"}
    ],
    "edges": [
      {"from":"1","to":"2","tone":"traversed"},
      {"from":"1","to":"4","tone":"queued"},
      {"from":"2","to":"3","tone":"queued"},
      {"from":"3","to":"4","tone":"default"}
    ],
    "facts": [
      {"name":"ledger", "value":"1 -> 1', 2 -> 2'", "tone":"green"},
      {"name":"new road", "value":"1' -> 2'", "tone":"blue"}
    ],
    "action":"done",
    "label":"After the recursive call returns, the copied road is attached in the new city. DFS keeps repeating that move for every neighbor."
  }
]
:::

:::stackblitz{file="step2-problem.ts" step=2 total=3 solution="step2-solution.ts"}

<details>
  <summary>Hints & gotchas</summary>

  - **Ask for the neighbor's copy, not the neighbor itself**: every edge in the cloned graph must stay inside the new graph.
  - **The ledger is the cycle breaker**: revisiting a node should return an existing copy instead of descending forever.
  - **Push neighbors in the same loop you traverse**: that is how the copied adjacency list is built.
</details>

### Step 3: Handle the Empty City and Return the Front Door Copy

The final wrapper just answers the entry question for the whole problem. If the given node is `null`, there is no city to rebuild. Otherwise start with a fresh ledger and clone the connected component reachable from the given node.

This step matters because it separates the recursive city-copy helper from the public function contract. The helper knows how to rebuild connected intersections. The wrapper knows what to do when there is no graph at all.

:::trace-graph
[
  {
    "nodes": [
      {"id":"1","label":"1","x":50,"y":15,"tone":"current","badge":"entry"},
      {"id":"2","label":"2","x":85,"y":50,"tone":"frontier"},
      {"id":"3","label":"3","x":50,"y":85,"tone":"frontier"},
      {"id":"4","label":"4","x":15,"y":50,"tone":"frontier"}
    ],
    "edges": [
      {"from":"1","to":"2","tone":"queued"},
      {"from":"1","to":"4","tone":"queued"},
      {"from":"2","to":"3","tone":"queued"},
      {"from":"3","to":"4","tone":"queued"}
    ],
    "facts": [
      {"name":"input", "value":"node 1", "tone":"blue"},
      {"name":"ledger", "value":"fresh map", "tone":"orange"}
    ],
    "action":"visit",
    "label":"Step 3 starts the full clone from the given entry node with a brand-new ledger."
  },
  {
    "nodes": [
      {"id":"1","label":"1","x":50,"y":15,"tone":"done","badge":"return copy(1)"},
      {"id":"2","label":"2","x":85,"y":50,"tone":"done"},
      {"id":"3","label":"3","x":50,"y":85,"tone":"done"},
      {"id":"4","label":"4","x":15,"y":50,"tone":"done"}
    ],
    "edges": [
      {"from":"1","to":"2","tone":"traversed"},
      {"from":"1","to":"4","tone":"traversed"},
      {"from":"2","to":"3","tone":"traversed"},
      {"from":"3","to":"4","tone":"traversed"}
    ],
    "facts": [
      {"name":"result", "value":"deep copy returned", "tone":"green"}
    ],
    "action":"done",
    "label":"The wrapper returns the copied version of the entry intersection, which leads into the whole rebuilt graph."
  }
]
:::

:::stackblitz{file="step3-problem.ts" step=3 total=3 solution="step3-solution.ts"}

<details>
  <summary>Hints & gotchas</summary>

  - **`null` stays `null`**: no entry node means no cloned graph.
  - **Use one fresh ledger per clone operation**: do not leak state between runs.
  - **Return the copied entry node**: that one reference is enough to reach the whole cloned component.
</details>

## Tracing through an Example

Take `adjList = [[2],[1,3],[2]]`.

:::trace-graph
[
  {
    "nodes": [
      {"id":"1","label":"1","x":20,"y":50,"tone":"current","badge":"start"},
      {"id":"2","label":"2","x":50,"y":50,"tone":"frontier"},
      {"id":"3","label":"3","x":80,"y":50,"tone":"default"}
    ],
    "edges": [
      {"from":"1","to":"2","tone":"active"},
      {"from":"2","to":"3","tone":"default"}
    ],
    "facts": [
      {"name":"ledger", "value":"{}", "tone":"orange"}
    ],
    "action":"mark",
    "label":"Start at node 1. Create copy(1) and record 1 -> copy(1)."
  },
  {
    "nodes": [
      {"id":"1","label":"1","x":20,"y":50,"tone":"done"},
      {"id":"2","label":"2","x":50,"y":50,"tone":"current","badge":"recurse"},
      {"id":"3","label":"3","x":80,"y":50,"tone":"default"}
    ],
    "edges": [
      {"from":"1","to":"2","tone":"traversed"},
      {"from":"2","to":"3","tone":"active"}
    ],
    "facts": [
      {"name":"ledger", "value":"{1,2}", "tone":"green"},
      {"name":"new road", "value":"copy(1) -> copy(2)", "tone":"blue"}
    ],
    "action":"expand",
    "label":"Node 1's neighbor is 2, so DFS builds copy(2) and attaches it to copy(1)."
  },
  {
    "nodes": [
      {"id":"1","label":"1","x":20,"y":50,"tone":"done"},
      {"id":"2","label":"2","x":50,"y":50,"tone":"done"},
      {"id":"3","label":"3","x":80,"y":50,"tone":"current","badge":"new"}
    ],
    "edges": [
      {"from":"1","to":"2","tone":"traversed"},
      {"from":"2","to":"3","tone":"traversed"}
    ],
    "facts": [
      {"name":"ledger", "value":"{1,2,3}", "tone":"green"},
      {"name":"new road", "value":"copy(2) -> copy(3)", "tone":"blue"}
    ],
    "action":"expand",
    "label":"From node 2, DFS builds copy(3) and attaches it to copy(2)."
  },
  {
    "nodes": [
      {"id":"1","label":"1","x":20,"y":50,"tone":"done"},
      {"id":"2","label":"2","x":50,"y":50,"tone":"done"},
      {"id":"3","label":"3","x":80,"y":50,"tone":"done"}
    ],
    "edges": [
      {"from":"1","to":"2","tone":"traversed"},
      {"from":"2","to":"3","tone":"traversed"}
    ],
    "facts": [
      {"name":"return", "value":"copy(1)", "tone":"green"}
    ],
    "action":"done",
    "label":"All reachable intersections now have copied versions, and every copied road points only inside the new graph."
  }
]
:::

## Recognizing This Pattern

- Reach for this pattern when a structure contains objects that point to other objects, and the goal is a true deep copy instead of reused references.
- The signal is "cycles or shared neighbors might exist," which means a plain recursive copy is unsafe without a visited map from old object to new object.
- The structural property is reuse: every original node must own exactly one copied node, no matter how many different paths reach it.
- The map-backed DFS beats brute force because each node is cloned once and each edge is translated once, giving `O(V + E)` time instead of repeatedly rebuilding the same subgraph.

## Complete Solution

:::stackblitz{file="solution.ts" step=3 total=3 solution="solution.ts"}
