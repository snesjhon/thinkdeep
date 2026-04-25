# Complete System Design Learning Path: Novice → Expert

---

## Philosophy

This curriculum is designed with the same pedagogical progression as thinkdeep:

- **Early steps** build foundational intuition with concrete, tangible systems
- **Middle steps** introduce distributed thinking and the trade-offs that come with scale
- **Late steps** combine everything into complex, production-grade system challenges

The insight behind this path: most system design resources teach you to recognize patterns ("oh, this needs a cache") without teaching you _why_ the pattern works or what breaks it. This path inverts that — **fundamentals first, scenarios second**.

The failure mode we're solving: knowing what consistent hashing is, but not being able to reason from it when a database partition question comes up in an interview.

### How It Works

Every step is split into two tiers:

- **Scenarios** — Do these when you first hit the step. Foundational systems that exercise the core concept. Goal: understand the mental model, reason through the trade-offs, build confidence. Move on after this.
- **Come Back** — Return to these after completing 1–2 more steps. These deepen the concept, introduce edge cases, and build the fluency you'll need under interview pressure.

Don't try to finish **Come Back** before moving to the next step. Forward momentum matters.

---

## 🌱 Phase 1: Novice

**Goal**: Build foundational design intuition with systems you can visualize and reason about concretely.

### Why Start Here?

- Data modeling and APIs are tangible — you can draw the tables and endpoints
- No distributed systems complexity yet — focus on _what you're building_, not _how it scales_
- Low cognitive overhead — concepts apply to systems you've used or built before
- Builds confidence with early wins before scale enters the picture

---

### Step 1: Data Modeling & Schema Design

**Mental Model**: Every system is just entities and relationships. Before you think about scale, think about what you're storing and why. A well-designed schema makes every other problem easier. A poorly designed one makes every other problem harder.

**What You Learn**:

- Entity identification and relationship mapping
- Normalization vs denormalization trade-offs
- Constraints (uniqueness, foreign keys, not-null) as data integrity guarantees
- Schema design as a forcing function for understanding requirements

**Concepts** _(specific mechanisms to study)_:

- Business rule enforcement — what belongs in the database vs the application layer
- Database constraints (NOT NULL, CHECK, UNIQUE, FK) — what each enforces and where violations surface
- Cardinality — one-to-one vs one-to-many vs many-to-many, how to recognize it in requirements
- Junction tables — how many-to-many relationships are actually implemented
- Normalization rules — 1NF, 2NF, 3NF as rules you can apply, not just vibes

**Scenarios** _(do these now — get the basics, understand the shape of data)_:

- Design the database schema for a frozen yogurt ordering system _(sizes, flavors, toppings with weights, max weight constraint, order status)_
- Design a user profile and authentication schema

**Come Back** _(return to after API Design — these add complexity on top of the basics)_:

- Design a permissions and roles schema (RBAC)
- Design a multi-tenant SaaS schema where one database serves multiple customers

**Why First**: You cannot design any system without understanding what it stores. This is the foundation everything else is built on.

---

### Step 2: API Design

**Mental Model**: An API is a contract between you and your consumers. Design for the consumer, not the implementation. The best APIs make the wrong thing hard to do and the right thing obvious.

**What You Learn**:

- REST resource modeling (nouns, not verbs)
- HTTP methods and what they actually mean (GET is safe and idempotent, POST is not)
- Status codes as intent, not just numbers
- Versioning strategies and why they matter
- Request/response shape design

**Concepts** _(specific mechanisms to study)_:

- HTTP method semantics — safe vs idempotent, what that means for clients and caches
- Status code intent — 400 vs 422 vs 409, 201 vs 200, when 204 is correct
- REST resource naming — why nouns not verbs, plural vs singular
- Pagination patterns — offset vs cursor vs keyset, why offset breaks at scale
- Versioning strategies — URL vs header vs content-type negotiation

**Scenarios** _(do these now)_:

- Design the REST API for the yogurt ordering system from Step 1 _(how do customers place orders? how do employees update status?)_
- Design a REST API for a simple task management app

**Come Back** _(return to after Relational Databases)_:

- Design a versioned public API with backward compatibility guarantees
- Design an API that supports pagination, filtering, and sorting at scale

**Why Now**: APIs are how systems talk to each other and to clients. Understanding API design early makes database and scaling decisions more concrete.

---

### Step 3: Relational Databases

**Mental Model**: Tables are truth. Indexes are shortcuts. Joins are the price you pay for normalization. Every index speeds up reads and slows down writes — there is no free lunch.

**What You Learn**:

- How indexes actually work (B-tree structure, why order matters)
- Query planning and what makes a query slow
- N+1 problems and how to spot them
- Transactions and what ACID guarantees actually mean
- When to normalize and when to intentionally denormalize

**Concepts** _(specific mechanisms to study)_:

- B-tree index mechanics — how the structure works, why column order in composite indexes matters
- Query planning — how to read EXPLAIN output, what sequential scan vs index scan tells you
- N+1 problem — how it emerges, how to detect and fix it
- ACID properties — what each guarantee actually means (not just the acronym)
- Isolation levels — read uncommitted through serializable, what anomaly each prevents

**Scenarios** _(do these now — schema first, then query patterns)_:

- Design the database for an e-commerce order system _(products, inventory, orders, line items, payments)_
- Design a social follows/followers schema and the queries it needs to support

**Come Back** _(return to after Caching Fundamentals)_:

- Design a schema that handles soft deletes and a full audit trail
- Design a reporting schema for a system with high write volume _(read replicas, materialized views, event tables)_

**Why Now**: Relational databases are the default choice for most systems. You need to know them deeply before you can know when to reach for something else.

---

### Step 4: Caching Fundamentals

**Mental Model**: A cache is a bet — you're trading consistency for speed. Every cache introduces the question: what happens when the cache and the database disagree? Know what you're willing to lose before you add a cache.

**What You Learn**:

- Read-through vs write-through vs write-behind cache patterns
- Cache invalidation strategies (TTL, event-driven, cache-aside)
- Cache eviction policies (LRU, LFU, FIFO) and when each makes sense
- What makes something a good cache candidate (read-heavy, slow to compute, tolerates staleness)
- Cache stampede and how to prevent it

**Concepts** _(specific mechanisms to study)_:

- Cache patterns — cache-aside vs read-through vs write-through vs write-behind, when each fits
- Cache invalidation strategies — TTL vs event-driven vs manual purge, why this is "one of the hard problems"
- Eviction policies — LRU vs LFU vs FIFO, what access pattern each is optimized for
- Cache stampede — what causes it, token locking and probabilistic early expiry as solutions

**Scenarios** _(do these now)_:

- Design a caching layer for a product catalog _(high read volume, infrequent updates)_
- Design session storage for a web application

**Come Back** _(return to after Scalability Fundamentals)_:

- Design a leaderboard that stays accurate in real-time with millions of score updates
- Design a news feed cache that balances freshness with performance

**Why Now**: Caching is the first tool you reach for when a system is slow. Understanding it deeply now prevents cargo-culting it later.

---

### Step 5: Scalability Fundamentals

**Mental Model**: Stateless services scale horizontally — just add more boxes. State is the hard part. Before you scale anything, ask: what state does this service hold, and where does it live?

**What You Learn**:

- Vertical vs horizontal scaling and when each is appropriate
- Stateless service design (why it enables horizontal scaling)
- Load balancing strategies (round-robin, least connections, consistent hashing)
- The difference between scaling reads and scaling writes
- Capacity estimation as a design skill (back-of-envelope math)

**Concepts** _(specific mechanisms to study)_:

- Stateless vs stateful services — what makes something stateful and why that blocks horizontal scaling
- Load balancing algorithms — round-robin vs least connections vs IP hash, when each matters
- Back-of-envelope estimation — the actual method: bytes, QPS, storage math

**Scenarios** _(do these now — simple systems with clear scaling requirements)_:

- Design a URL shortener _(high read volume, simple writes, global availability)_
- Design a paste bin _(similar shape to URL shortener, adds content storage)_

**Come Back** _(return to after Database Scaling)_:

- Design a web crawler _(distributed, stateful, politeness constraints)_
- Design a job scheduler _(distributed coordination, exactly-once execution)_

**Why Now**: Scalability thinking underlies every Phase 2 topic. Build the intuition before the complexity arrives.

---

## 🎓 Checkpoint: Novice → Studied

**You should now be able to**:
✅ Design a schema from a set of requirements
✅ Model a REST API for a given system
✅ Reason about indexes and query performance
✅ Explain cache trade-offs for a given read/write pattern
✅ Do basic capacity estimation and identify the scaling bottleneck

---

## 📚 Phase 2: Studied

**Goal**: Think in distributed systems. Reason about trade-offs under scale, failure, and concurrency.

### Why This Phase?

- Phase 1 assumed one database and one server. Phase 2 breaks both assumptions.
- Distributed systems introduce failure modes that don't exist on a single machine
- The trade-offs here (consistency vs availability, latency vs throughput) are what senior interview questions are about

---

### Step 6: Database Scaling

**Mental Model**: You scale reads first (replicas), then writes (sharding). Never shard before you have to — it adds enormous complexity. When you do shard, your shard key is the most important decision you'll make.

**What You Learn**:

- Read replicas: how replication lag works and when it causes problems
- Vertical partitioning (splitting tables) vs horizontal partitioning (sharding rows)
- Shard key selection and the hot partition problem
- Cross-shard queries and why they're painful
- When to reach for a distributed database (Cassandra, DynamoDB) vs sharding Postgres

**Concepts** _(specific mechanisms to study)_:

- Replication lag — how async replication works, what eventual consistency means in this context
- Sharding strategies — range vs hash vs directory, what each optimizes and what it breaks
- Hot partition problem — what causes it, how shard key selection creates or avoids it

**Scenarios** _(do these now)_:

- Design the database architecture for a Twitter-scale read-heavy timeline
- Design a multi-region e-commerce database with inventory consistency

**Come Back** _(return to after Consistent Hashing)_:

- Design a globally distributed user preferences system with low read latency everywhere
- Design a system that needs cross-shard transactions without a distributed database

**Why Now**: Every Phase 2 topic assumes you understand what happens when one database isn't enough.

---

### Step 7: Consistent Hashing

**Mental Model**: With a fixed hash space, adding or removing nodes reshuffles every key — catastrophic for a distributed cache. Consistent hashing puts nodes and keys on a ring so that only a neighbor's keys need to move. The ring doesn't care how many nodes you have.

**What You Learn**:

- Why naive modulo hashing fails when nodes change
- The hash ring and virtual nodes
- How virtual nodes improve load distribution
- Where consistent hashing is used in practice (Cassandra, DynamoDB, distributed caches)
- The trade-off between virtual node count and rebalancing cost

**Concepts** _(specific mechanisms to study)_:

- Modulo hashing failure mode — why naive hashing breaks when nodes change
- Hash ring mechanics — how keys and nodes are placed, how lookup works
- Virtual nodes — why they exist and how they improve load distribution

**Scenarios** _(do these now)_:

- Design a distributed cache (Memcached-style) that handles node additions and removals gracefully
- Design a distributed key-value store with configurable replication factor

**Come Back** _(return to after Message Queues)_:

- Design a CDN routing system that routes requests to the nearest healthy edge node
- Design a distributed session store that survives node failures without session loss

**Why Now**: Consistent hashing is the foundation of how distributed data stores partition data. You'll see it everywhere in Phase 2 and 3.

---

### Step 8: Message Queues & Async Processing

**Mental Model**: A queue decouples the producer from the consumer. The producer sends a message and forgets — it doesn't wait, doesn't care if the consumer is slow, doesn't retry. The queue handles durability, delivery, and backpressure. This is what makes async systems composable.

**What You Learn**:

- Queue vs stream semantics (Kafka vs SQS)
- At-least-once vs exactly-once delivery and why exactly-once is hard
- Dead letter queues and retry strategies
- Backpressure and what happens when consumers can't keep up
- Fan-out patterns (one message, many consumers)

**Concepts** _(specific mechanisms to study)_:

- Queue vs stream semantics — destructive read (SQS-style) vs log (Kafka-style), what that means for consumers
- Delivery guarantees — at-most-once vs at-least-once vs exactly-once, why exactly-once is expensive
- Idempotency — what it means, how to design for it with idempotency keys
- Dead letter queues — what goes there, how to handle it operationally
- Backpressure — what happens when consumers fall behind, strategies to handle it

**Scenarios** _(do these now)_:

- Design a notification system (email + push) that decouples sending from the triggering event
- Design an image processing pipeline _(upload → resize → thumbnail → store)_

**Come Back** _(return to after CAP Theorem)_:

- Design an order processing system with retries, idempotency, and a dead letter queue
- Design a real-time event streaming platform (Kafka-style) for analytics ingestion

**Why Now**: Async processing is how you scale write-heavy systems and decouple services. It appears in almost every Phase 3 scenario.

---

### Step 9: CAP Theorem & Consistency Models

**Mental Model**: When the network partitions (and it will), you must choose: serve potentially stale data (AP) or refuse to answer until you're sure you're consistent (CP). There is no third option. Most systems make this choice implicitly — this step makes it explicit.

**What You Learn**:

- What a network partition actually is (and why it's unavoidable)
- CP systems: sacrifice availability for consistency (banking, inventory)
- AP systems: sacrifice consistency for availability (social counts, shopping carts)
- Eventual consistency: what it means for users and how to design around it
- Conflict resolution strategies (last-write-wins, vector clocks, CRDTs)

**Concepts** _(specific mechanisms to study)_:

- Network partition defined — what it actually is, why it's unavoidable
- CP vs AP trade-off — concrete system examples, not just definitions
- Eventual consistency — what "eventually" means in practice and its user-facing implications
- Conflict resolution strategies — last-write-wins vs vector clocks vs CRDTs, when each applies

**Scenarios** _(do these now — pick a clear side of the trade-off for each)_:

- Design a bank account transfer system _(CP — wrong balance is never acceptable)_
- Design a social media like/view counter _(AP — slightly stale count is fine)_

**Come Back** _(return to after Rate Limiting)_:

- Design a distributed configuration system that all services read at startup
- Design a collaborative document editor where two users can edit simultaneously

**Why Now**: You've been making this trade-off implicitly since Step 3. This step makes it a first-class design decision.

---

### Step 10: Rate Limiting

**Mental Model**: Rate limiting protects resources from being overwhelmed — by bad actors, by bugs, or by popularity. You're not rejecting users permanently; you're enforcing fairness. The algorithm you choose determines how "fair" feels.

**What You Learn**:

- Token bucket vs leaky bucket vs fixed window vs sliding window algorithms
- Where to enforce rate limits (API gateway, service layer, database)
- Distributed rate limiting: how to count across multiple servers
- Rate limit headers and how to communicate limits to clients
- Graceful degradation vs hard rejection

**Concepts** _(specific mechanisms to study)_:

- Token bucket mechanics — how the algorithm works, how it allows controlled bursts
- Sliding window vs fixed window — why fixed window has a boundary exploit
- Distributed rate limiting — why counting across servers is hard, Redis INCR + TTL approach

**Scenarios** _(do these now)_:

- Design a rate limiter for a public REST API _(per API key, per endpoint)_
- Design a per-user rate limiter for a SaaS application

**Come Back** _(return to after Storage & CDN)_:

- Design a distributed rate limiter using Redis that works across 50 API servers
- Design a rate limiter that allows short bursts but enforces a sustained limit

**Why Now**: Rate limiting combines consistent hashing, caching, and distributed coordination — a synthesis of Phase 2 so far.

---

### Step 11: Storage & CDN

**Mental Model**: CDNs move data closer to users — the closer the data, the lower the latency. Storage tiers match access frequency: hot data (SSD, in-memory) costs more, cold data (object store, tape) costs less. Match the tier to the access pattern.

**What You Learn**:

- Object storage vs block storage vs file storage and when to use each
- CDN architecture: origin, edge nodes, cache-control headers
- Cache invalidation at the CDN level (purging vs TTL)
- Pre-signed URLs for secure direct uploads
- Storage tiering: hot, warm, cold, archive

**Concepts** _(specific mechanisms to study)_:

- Object vs block vs file storage — what each is, canonical use cases for each
- CDN cache-control headers — Cache-Control, Vary, surrogate keys, how they direct edge behavior
- Pre-signed URLs — how they work, why direct-to-S3 upload bypasses your servers

**Scenarios** _(do these now)_:

- Design a file upload system _(direct-to-S3 uploads, metadata in a database)_
- Design a photo storage and serving system at Instagram scale

**Come Back** _(return to after Distributed Transactions)_:

- Design a video streaming platform _(chunked storage, adaptive bitrate, CDN delivery)_
- Design a multi-region content delivery system with consistent invalidation

**Why Now**: Storage and CDN complete the Phase 2 picture — you now have all the building blocks for Phase 3 complex systems.

---

## 🎓 Checkpoint: Studied → Expert

**You should now be able to**:
✅ Reason about database scaling decisions (replicas vs sharding vs distributed DB)
✅ Explain consistent hashing and where it applies
✅ Design async systems using message queues
✅ Make explicit CAP trade-off decisions for a given system
✅ Design a rate limiter with the right algorithm for the constraints
✅ Choose the right storage tier and CDN strategy for a given access pattern

---

## 🎯 Phase 3: Expert

**Goal**: Combine Phase 1 and Phase 2 concepts into complex, production-grade systems. Reason about failure modes, operational concerns, and architectural trade-offs at depth.

---

### Step 12: Distributed Transactions

**Mental Model**: ACID is easy on one machine — the database handles it. On multiple machines, you have to orchestrate it yourself. Two-phase commit gives you safety at the cost of availability. Sagas give you availability at the cost of simplicity. Pick based on what failure means for your users.

**What You Learn**:

- Why distributed transactions are hard (network partitions, partial failures)
- Two-phase commit (2PC): what it guarantees and why it's rarely used in practice
- Saga pattern: choreography vs orchestration
- Idempotency keys as the foundation of safe retries
- Compensating transactions (how to "undo" a distributed operation)

**Concepts** _(specific mechanisms to study)_:

- Two-phase commit — the protocol, why it blocks, why it's rarely used in practice
- Saga pattern — choreography vs orchestration, trade-offs between the two
- Compensating transactions — how to "undo" an operation when rollback isn't possible
- Idempotency keys — safe retries at the distributed transaction boundary

**Scenarios** _(do these now)_:

- Design a payment processing system _(charge card + fulfill order + send receipt — all or nothing)_
- Design a hotel booking system that prevents double-booking across a distributed inventory

**Come Back** _(return to after Real-time Systems)_:

- Design an order management system using the saga pattern with compensating transactions
- Design a cross-service inventory reservation system that handles partial failures gracefully

---

### Step 13: Real-time Systems

**Mental Model**: "Real-time" is a spectrum. Polling is lazy pull — simple but wasteful. Long polling is hopeful pull — better but awkward. WebSockets is a persistent bidirectional connection — powerful but stateful. SSE is a one-way server stream — perfect for dashboards. Match the mechanism to the update pattern.

**What You Learn**:

- Polling vs long polling vs WebSockets vs Server-Sent Events trade-offs
- Why WebSocket connections are stateful and what that means for scaling
- Presence systems: how to know if a user is online
- Message fan-out at scale (how Slack delivers a message to 10,000 channel members)
- Pub/sub at the infrastructure level

**Concepts** _(specific mechanisms to study)_:

- WebSocket vs SSE — when each is appropriate, bidirectional vs one-way push
- Presence systems — heartbeat + TTL pattern and its edge cases
- Fan-out problem — delivering one event to N subscribers at scale

**Scenarios** _(do these now)_:

- Design a live chat system (Slack-style) _(messages, channels, presence)_
- Design a real-time collaborative whiteboard _(concurrent edits, conflict resolution)_

**Come Back** _(return to after Search Systems)_:

- Design a live sports score system _(millions of readers, infrequent writes, low tolerance for stale data)_
- Design the backend for a real-time multiplayer game _(state sync, lag compensation)_

---

### Step 14: Search Systems

**Mental Model**: Full-text search is an inverted index — you index words to find documents, not documents to find words. Every search optimization is a trade-off between index size, write throughput, and query latency. Relevance ranking is a separate problem from retrieval.

**What You Learn**:

- How inverted indexes work (tokenization, stemming, posting lists)
- Elasticsearch architecture (shards, replicas, mapping)
- Typeahead/autocomplete as a different problem from full-text search
- Relevance scoring (TF-IDF, BM25) and when it matters
- Search index vs database: why you often need both

**Concepts** _(specific mechanisms to study)_:

- Inverted index — how it's built, why it enables fast full-text search
- TF-IDF and BM25 — what relevance scoring is doing, when it matters for results
- Typeahead as a different problem — prefix trees and prefix-indexed sorted sets, not full-text

**Scenarios** _(do these now)_:

- Design a typeahead/autocomplete system for a search bar _(latency-critical, prefix matching)_
- Design a product search for e-commerce _(filters, facets, relevance ranking)_

**Come Back** _(return to after Observability)_:

- Design a full-text search engine for a document corpus (Elasticsearch-style)
- Design a personalized search ranking system that learns from user behavior

---

### Step 15: Observability & Monitoring

**Mental Model**: You can't fix what you can't see. Logs are individual events. Metrics are aggregated trends. Traces are the journey of a single request through multiple services. You need all three — they answer different questions.

**What You Learn**:

- The three pillars: logs, metrics, traces
- Structured logging vs unstructured logging
- Metrics cardinality and why it matters for cost
- Distributed tracing: trace IDs, span propagation, sampling
- Alerting on symptoms vs causes

**Concepts** _(specific mechanisms to study)_:

- Logs vs metrics vs traces — what question each answers, why you need all three
- Cardinality in metrics — why high-cardinality labels destroy your observability budget
- Distributed tracing mechanics — trace ID propagation, spans, sampling strategies

**Scenarios** _(do these now)_:

- Design a centralized logging system for a microservices application
- Design an alerting system for infrastructure health

**Come Back** _(return to after Microservices)_:

- Design a distributed tracing system (Jaeger/Zipkin-style)
- Design an anomaly detection system that pages on unusual patterns without alert fatigue

---

### Step 16: Microservices vs Monolith

**Mental Model**: Microservices trade operational simplicity for deployment flexibility. Only split when the monolith's coupling is actively hurting you — slow deploys, inability to scale one component, team coordination overhead. The hardest part of microservices isn't the technology, it's the service boundaries.

**What You Learn**:

- When to stay monolith (most of the time, earlier than you think)
- Service decomposition patterns (by domain, by team, by scaling requirement)
- The strangler fig pattern for incremental migration
- Service-to-service communication (sync REST/gRPC vs async messaging)
- The distributed monolith anti-pattern and how to avoid it

**Concepts** _(specific mechanisms to study)_:

- Service decomposition principles — by domain, by scaling requirement, by team (Conway's Law)
- Strangler fig pattern — how incremental migration from a monolith actually works
- Circuit breaker — what it does, closed/open/half-open states

**Scenarios** _(do these now)_:

- Design the migration of a monolith e-commerce application to microservices _(what splits first, what stays together)_
- Design the service boundaries for a ride-sharing application _(riders, drivers, matching, payments, notifications)_

**Come Back** _(return to during final review)_:

- Design a service mesh with circuit breakers, retries, and timeouts
- Design a blue-green deployment system for a microservices platform

---

## 🎓 Checkpoint: Expert

**You should now be able to**:
✅ Design distributed transaction systems with appropriate consistency guarantees
✅ Choose the right real-time mechanism for a given update pattern
✅ Design search systems with the right index architecture
✅ Instrument a system for observability from day one
✅ Reason about service decomposition trade-offs

---

## 💡 Key Principles

### 1. **Fundamentals Over Patterns**

Don't memorize "use a cache here." Understand _why_ a cache helps, _what_ it breaks, and _when_ to reach for it. The pattern recognition comes naturally once the fundamentals are solid.

### 2. **Trade-offs Are The Answer**

System design questions don't have one right answer. The right answer is a well-reasoned trade-off. The interviewer wants to see you think through the options, not recite a template.

### 3. **Requirements First, Always**

Every design starts with: what are we storing, how often is it read, how often is it written, what's the failure tolerance, what's the scale? Don't design until you know what you're designing for.

### 4. **The Database Is Usually the Bottleneck**

In most systems, the database is where scale problems show up first. Know your database deeply — schema, indexes, query patterns, replication — before reaching for exotic solutions.

### 5. **Speak Out Loud**

System design is evaluated as much on _how you think_ as _what you conclude_. Narrate your reasoning. Name the trade-offs explicitly. Ask clarifying questions before committing to a design.

---

## 📖 How to Use This Path

1. **Don't skip steps**: Phase 1 concepts appear inside Phase 2 and 3 scenarios
2. **Do the Scenarios first**: Finish the main scenarios before returning to Come Back
3. **Use the evaluator**: After reading the fundamentals, speak your understanding back before moving to scenarios. Catch gaps early.
4. **Come Back is not optional**: The reinforcement pass is where depth is built
5. **Reference freely**: Once you've studied a topic, come back to it whenever a new scenario touches it

---

## 🎓 Final Thought

This path is harder than it looks from the outside — not because the individual concepts are complex, but because the _combinations_ are. A payment system problem isn't just "distributed transactions." It's schema design + API design + consistent hashing + CAP trade-offs + message queues, all at once, under time pressure.

The fundamentals are what let you decompose complex problems. Learn them deeply. The scenarios are just practice applying them.

**Trust the fundamentals. Everything else follows.**
