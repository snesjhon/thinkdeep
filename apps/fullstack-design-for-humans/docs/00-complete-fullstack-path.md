# Complete Fullstack Learning Path: Novice → Expert

---

## Philosophy

This curriculum builds a real Rails chess app from scratch — one step at a time, in the order that concepts depend on each other.

Every step has two things to generate:

- **A foundations guide** — teaches the concept before the learner touches code. What does this Rails feature _do_? Why does it work this way? What breaks if you get it wrong? Generated with `/fullstack-fundamentals`.
- **Scenarios** — build tasks. The learner writes actual Rails or React code. The app isn't done until every scenario is done. Generated with `/fullstack-scenario`.

The failure mode this path avoids: learners who can recite what `belongs_to` does but freeze when asked to design the models for a new feature. Foundations build the mental model. Scenarios force application under real constraints.

### The Two Skills

```bash
/fullstack-fundamentals {slug}        # generates the concept guide + evaluator prompt
/fullstack-scenario "{Scenario Name}" # generates brief + walkthrough + CheckWork prompt
```

Each step below lists the exact commands to run, in order.

---

## 🌱 Phase 1: Novice

**Goal**: Build a working Rails API from scratch. Focus on the conventions, not the configuration.

### Why Start Here?

- Rails conventions are invisible until you understand the folder structure — start there
- The database and models come before the API — you can't expose what doesn't exist yet
- No async behavior, no external integrations — just Rails doing what Rails was designed for
- Every Phase 2 and 3 concept builds directly on what gets built here

---

### Step 1: Project Anatomy

**What to Generate**

```bash
/fullstack-fundamentals rails-new
/fullstack-scenario "Set Up the Rails API"
```

_Foundations covers_: what `rails new` generates, what each flag does, why the folder structure exists.

**Mental Model**: A Rails app is a set of conventions baked into folders. Understanding the folders is understanding the framework.

**Analogy**: Rails folder structure as a restaurant kitchen layout — everything has a designated place so the chef doesn't have to think about it.

**Why First**: You can't reason about a Rails app without knowing what's in it. This step gives the learner a map before anything else is built.

---

### Step 2: Database Fundamentals

**What to Generate**

```bash
/fullstack-fundamentals postgresql-and-activerecord
/fullstack-scenario "Configure the Database"
```

_Foundations covers_: how PostgreSQL and ActiveRecord work together to store and retrieve data.

**Mental Model**: The database is the source of truth. Everything else is a cache or a view of it.

**Analogy**: PostgreSQL vs SQLite as a bank vault vs a shoebox — both hold money, but only one is built for concurrent access.

**Why Now**: The models and migrations in the next step depend on the database being configured and running. Get the foundation in place before building on it.

---

### Step 3: Entities and Relationships

**What to Generate**

```bash
/fullstack-fundamentals active-record-models
/fullstack-scenario "Build the Player Model"
/fullstack-scenario "Build the Game Model"
/fullstack-scenario "Build the Analysis Model"
```

_Foundations covers_: how to model real-world objects as Rails models with associations and validations.

**Mental Model**: Every model is a noun. Every association is a verb. Name them that way.

**Analogy**: Schema as a city map — streets (foreign keys) connect buildings (tables), but the buildings existed before the streets.

**Why Now**: The API can't expose resources that don't exist in the database. Models and schema come before routes and controllers.

---

### Step 4: REST API Basics

**What to Generate**

```bash
/fullstack-fundamentals rails-routing-and-controllers
/fullstack-scenario "Build the Players API"
/fullstack-scenario "Build the Games API"
/fullstack-scenario "Build the Analyses API"
```

_Foundations covers_: how a request flows from URL to controller to JSON response.

**Mental Model**: A REST API is a collection of resources. Each resource is a noun. HTTP verbs are the only actions.

**Analogy**: API routes as a filing cabinet — the cabinet name is the resource, the HTTP verb is what you do to the drawer.

**Why Now**: With models in place, the app can now expose them over HTTP. This is the last step of Phase 1 — the API is functional end to end after this.

---

## 🎓 Checkpoint: Novice → Studied

**You should now have generated**:

- ✅ 4 foundations guides
- ✅ 8 scenarios covering project setup, database config, all three models, and all three API endpoints
- ✅ A working Rails API with Players, Games, and Analyses endpoints

---

## 📚 Phase 2: Studied

**Goal**: Add production-grade behavior — async jobs, external integrations, and structured AI output.

### Why This Phase?

- Phase 1 built the API. Phase 2 makes it do real work.
- Syncing from chess.com, analyzing with Claude, and running jobs in the background are the features that make the app useful
- These patterns (service objects, background jobs, structured LLM output) appear in nearly every production Rails app

---

### Step 5: Migrations and Indexes

**What to Generate**

```bash
/fullstack-fundamentals rails-migrations
/fullstack-scenario "Add Indexes to the Games Table"
/fullstack-scenario "Add Metadata Columns to Games"
```

_Foundations covers_: how migrations track schema changes safely and when to add indexes.

**Mental Model**: A migration is a permanent record of a decision. An index is a bet that you'll look up this column often.

**Analogies**:

- Migration as a legal amendment — you add to the document, you never cross out what came before
- Index as a book's index at the back — you look up the word, find the page. Every new entry costs ink.

**Why Now**: The initial models are in place. Before adding the sync job in the next step, the Games table needs the indexes and columns (like `time_class`, `played_at`) that the sync job will populate and query against.

---

### Step 6: Background Jobs

**What to Generate**

```bash
/fullstack-fundamentals active-job-and-sidekiq
/fullstack-scenario "Build the Sync Games Job"
/fullstack-scenario "Build the Analyze Game Job"
```

_Foundations covers_: how Sidekiq and Redis enable processing work outside the request/response cycle.

**Mental Model**: A background job is a note you leave for yourself. The request handler drops the note and walks away.

**Analogy**: Background job as a postal service — you hand off the package, the post office handles delivery and retries.

**Why Now**: Syncing games and running analysis are both slow operations that don't belong in the request cycle. The jobs depend on the chess.com client and Claude API — but the job _structure_ (ActiveJob, Sidekiq config, queueing) is introduced here before those integrations are built.

---

### Step 7: External HTTP Clients

**What to Generate**

```bash
/fullstack-fundamentals http-clients-in-rails
/fullstack-scenario "Build the chess.com API Client"
/fullstack-scenario "Handle Client Errors and Retries"
```

_Foundations covers_: how to wrap third-party APIs in service objects that handle errors and timeouts gracefully.

**Mental Model**: An external API is a dependency you can't deploy. Design your code to tolerate it being slow, down, or wrong.

**Analogy**: Service object wrapping an API as a translator hired for one job — you tell the translator what you need, they handle the foreign language.

**Why Now**: The sync job needs a working chess.com client before it can fetch games. Error handling and retries are a separate scenario because they're the part most learners skip — and the part most likely to cause production incidents.

---

### Step 8: The Claude API

**What to Generate**

```bash
/fullstack-fundamentals the-claude-api
/fullstack-scenario "Build Per-Game Analysis"
/fullstack-scenario "Build Aggregate Style Analysis"
/fullstack-scenario "Build the Chess Chat Interface"
```

_Foundations covers_: how the Claude API works — stateless calls, prompt construction, and structured JSON output.

**Mental Model**: The API doesn't remember you. Every call is stateless. You pass the full context every time.

**Analogy**: Claude API call as a conversation with someone who has amnesia — brilliant, but you must re-introduce yourself every time.

**Why Now**: The analyze job from Step 6 needs a real Claude integration to do its work. Three scenarios here because the use cases are meaningfully different: per-game analysis (structured output), aggregate analysis (reasoning across many games), and chat (open-ended conversational context).

---

## 🎓 Checkpoint: Studied → Expert

**You should now have generated**:

- ✅ 4 additional foundations guides
- ✅ 9 additional scenarios covering migrations, background jobs, the chess.com client, and Claude integration
- ✅ A backend that syncs games, analyzes them with Claude, and serves all results over the API

---

## 🎯 Phase 3: Expert

**Goal**: Connect the backend to a real frontend, ship it to production, and understand what changes at the boundary.

### Why This Phase?

- The backend works in isolation. Phase 3 exposes it to a browser.
- CORS, environment config, and deployment are all about the seams between systems
- The React scenarios complete the user-facing product

---

### Step 9: CORS and the API Boundary

**What to Generate**

```bash
/fullstack-fundamentals cors-and-rack
/fullstack-scenario "Build the React Dashboard"
/fullstack-scenario "Build the Game Detail View"
```

_Foundations covers_: why browsers enforce CORS and how to configure it correctly in a Rails API.

**Mental Model**: CORS is a bouncer. The browser checks the guest list (allowed origins) before the request gets in.

**Analogy**: CORS as a bouncer at a club — your origin is checked at the door, not inside the venue.

**Why Now**: The React app can't talk to the Rails API until CORS is configured. The dashboard and game detail are the first two React views — introduced here so the learner sees CORS fail and then fix it in context.

---

### Step 10: Frontend Integration

**What to Generate**

```bash
/fullstack-fundamentals react-consuming-rails-api
/fullstack-scenario "Build the Player Profile Page"
/fullstack-scenario "Build the Analysis Display"
/fullstack-scenario "Build the Chat Interface"
/fullstack-scenario "Build the Sync Trigger UI"
```

_Foundations covers_: how a React app fetches data from a Rails API — the contract, state management, and error handling.

**Mental Model**: The API contract is more important than the implementation. Your frontend depends on the shape of the response, not how it was built.

**Analogy**: API contract as a power outlet standard — the plug shape is agreed on so devices can work anywhere without knowing how the grid works.

**Why Now**: With CORS working and the API fully built, the remaining frontend views can be completed. These four scenarios finish the React app: player profile (stats + aggregate analysis), analysis display (per-game breakdown), chat interface (React side of the chess chat endpoint), and sync trigger (kick off a game sync from the UI).

---

### Step 11: Environment Config and Deployment

**What to Generate**

```bash
/fullstack-fundamentals env-vars-and-render
/fullstack-scenario "Deploy to Render"
```

_Foundations covers_: how environment variables manage config across environments and how to deploy a Rails API to Render.

**Mental Model**: Env vars are the one thing that's different between development and production. They're the seams.

**Analogy**: Env vars as the ingredients list that changes by location — same recipe, different water source.

**Why Last**: Deployment is the final step because it requires a complete, working app. The learner ships what they built.

---

## 🎓 Checkpoint: Expert

**You should now have generated**:

- ✅ 3 additional foundations guides
- ✅ 7 additional scenarios completing the React frontend and shipping to production
- ✅ A fully deployed chess app with game sync, AI analysis, and a working UI

---

## 📋 Full Generation Inventory

### Foundations Guides (11 total)

| Slug                            | Step                                   |
| ------------------------------- | -------------------------------------- |
| `rails-new`                     | 1 — Project Anatomy                    |
| `postgresql-and-activerecord`   | 2 — Database Fundamentals              |
| `active-record-models`          | 3 — Entities and Relationships         |
| `rails-routing-and-controllers` | 4 — REST API Basics                    |
| `rails-migrations`              | 5 — Migrations and Indexes             |
| `active-job-and-sidekiq`        | 6 — Background Jobs                    |
| `http-clients-in-rails`         | 7 — External HTTP Clients              |
| `the-claude-api`                | 8 — The Claude API                     |
| `cors-and-rack`                 | 9 — CORS and the API Boundary          |
| `react-consuming-rails-api`     | 10 — Frontend Integration              |
| `env-vars-and-render`           | 11 — Environment Config and Deployment |

### Scenarios (24 total)

| Slug                     | Label                            | Step |
| ------------------------ | -------------------------------- | ---- |
| `setup-rails-api`        | Set Up the Rails API             | 1    |
| `configure-the-database` | Configure the Database           | 2    |
| `model-players`          | Build the Player Model           | 3    |
| `model-games`            | Build the Game Model             | 3    |
| `model-analyses`         | Build the Analysis Model         | 3    |
| `players-api`            | Build the Players API            | 4    |
| `games-api`              | Build the Games API              | 4    |
| `analyses-api`           | Build the Analyses API           | 4    |
| `add-game-indexes`       | Add Indexes to the Games Table   | 5    |
| `add-games-metadata`     | Add Metadata Columns to Games    | 5    |
| `sync-games-job`         | Build the Sync Games Job         | 6    |
| `analyze-game-job`       | Build the Analyze Game Job       | 6    |
| `chess-com-client`       | Build the chess.com API Client   | 7    |
| `handle-client-errors`   | Handle Client Errors and Retries | 7    |
| `per-game-analysis`      | Build Per-Game Analysis          | 8    |
| `aggregate-analysis`     | Build Aggregate Style Analysis   | 8    |
| `chess-chat`             | Build the Chess Chat Interface   | 8    |
| `dashboard`              | Build the React Dashboard        | 9    |
| `game-detail`            | Build the Game Detail View       | 9    |
| `player-profile-page`    | Build the Player Profile Page    | 10   |
| `analysis-display`       | Build the Analysis Display       | 10   |
| `chat-interface`         | Build the Chat Interface         | 10   |
| `sync-trigger`           | Build the Sync Trigger UI        | 10   |
| `deploy-to-render`       | Deploy to Render                 | 11   |

---

## 💡 Key Principles

### 1. **Foundations Before Scenarios**

Never generate a scenario for a step before its foundations guide exists. The learner reads the guide before touching the build task. The guide is what makes the scenario learnable rather than just frustrating.

### 2. **Order Is the Design**

The steps are ordered by dependency, not difficulty. You can't build the API before the models. You can't run jobs before the job infrastructure exists. Don't skip steps.

### 3. **Scenarios Complete the App**

Every scenario exists because the app needs it. If a feature is in the app, there's a scenario for it. If a scenario gets added, the app gains a feature.

### 4. **CheckWork Is the Contract**

The `prompt.md` for each scenario defines what "done" means. Write the evaluator before writing the walkthrough — the evaluator tells you what the walkthrough needs to teach.

---

## 📖 How to Use This Path

1. **Work step by step** — generate the foundations guide first, then the scenarios for that step
2. **Run the skills in the order listed** — each command is independent but ordered by dependency
3. **Update `lib/journey.ts`** after adding new scenarios to keep the app curriculum in sync with this doc
4. **CheckWork is the arbiter** — if the evaluator doesn't catch it, the scenario isn't done
