# fullstack-design-for-humans — Design Spec

**Date:** 2026-03-28
**Status:** Approved

---

## Overview

A new app in the `for-humans` monorepo that teaches fullstack development by guiding the learner through building a real chess learning app from scratch. The platform provides the curriculum, mental models, and evaluator prompts. The chess app is the thing actually being built.

Two goals run in parallel:
1. **Chess learning** — the app syncs your chess.com games, visualizes your play, and uses Claude to generate tailored analysis, lessons, and a chat interface
2. **Fullstack learning** — each piece of the chess app is a scenario in the curriculum, teaching backend fundamentals through real implementation

---

## Two-Project Structure

### `for-humans/apps/fullstack-design-for-humans`
The learning platform. Lives in the monorepo alongside `system-design-for-humans`. Same structure:
- `lib/journey.ts` — curriculum phases, sections, scenarios
- `app/scenarios/{slug}/brief.md` — what to build (no solution hints)
- `app/scenarios/{slug}/walkthrough.md` — mental models, analogies, why decisions matter
- `app/scenarios/{slug}/prompt.md` — evaluator prompt Claude uses to check the learner's code

### Separate `chess-learning` project
The actual Rails + React app the learner builds. Lives outside the monorepo. Claude reads this project's code when checking work.

---

## Teaching Approach

- **Concept-first for new topics** — explain the mental model and analogy before giving the task
- **Task-first for reinforcement** — give the task, learner attempts it, then we discuss decisions
- **Socratic when stuck** — ask questions that help the learner reason it out; only give the answer if genuinely blocked
- **Claude checks real code** — evaluator reads actual files in the chess project, not abstract answers
- **Learner writes the code** — Claude guides, explains, and reviews. Claude does not scaffold or generate implementation.

---

## Curriculum Phases

### Phase 1: Foundations — "Before the first line of code"
Goal: understand what you're setting up and why, before touching Rails.

Sections:
- **Project anatomy** — what Rails API mode is, why it's different from a full Rails app, what each generated file does
  - mentalModelHook: "A Rails app is a set of conventions baked into folders. Understanding the folders is understanding the framework."
  - analogies: ["Rails folder structure as a restaurant's kitchen layout — everything has a place so the chef doesn't have to think about it"]
- **Database setup** — PostgreSQL, why not SQLite for production, what a connection pool is
  - mentalModelHook: "The database is the source of truth. Everything else is a cache or a view of it."

Scenarios tied to chess app:
- `setup-rails-api` — Initialize the Rails app, configure PostgreSQL, verify the connection

---

### Phase 2: Data Modeling — "What are you storing and why"
Goal: design a schema by reasoning about entities and relationships, not memorizing patterns.

Sections:
- **Entities and relationships** — identifying nouns, modeling how they relate, when to use a foreign key vs embed
  - mentalModelHook: "Every model is a noun. Every association is a verb. Name them that way."
  - analogies: ["Schema as a city map — streets (foreign keys) connect buildings (tables), but the buildings existed before the streets"]
- **Migrations** — what a migration is, why order matters, how to think about schema as an append-only log of decisions
  - mentalModelHook: "A migration is a permanent record of a decision. You don't rewrite history — you add to it."
- **Indexes** — when to add them, what they cost, how to think about query patterns before writing any code
  - mentalModelHook: "An index is a bet that you'll look up this column often. Every index has a write cost. Don't add them speculatively."

Scenarios tied to chess app:
- `model-players` — Design and build the Player model. What fields does it need? Why?
- `model-games` — Design the Game model. What's the relationship to Player? What does accuracy mean as a column type?
- `model-analyses` — Design the Analysis model. Why is game_id nullable? What does jsonb give you that text doesn't?

---

### Phase 3: REST API Design — "Designing the contract"
Goal: design endpoints that are intuitive to consumers, not just convenient for the implementation.

Sections:
- **Resources and routes** — REST as nouns and verbs, what makes a good resource, when nested routes help vs hurt
  - mentalModelHook: "A REST API is a collection of resources. Each resource is a noun. HTTP verbs are the only actions."
  - analogies: ["API routes as a filing cabinet — the cabinet name is the resource, the action is what you do to the drawer"]
- **Controllers and serialization** — what a controller's job actually is (thin), what serialization means and why you'd want it
  - mentalModelHook: "A controller is an air traffic controller — it doesn't fly the plane, it tells others where to go."
- **Request/response shape** — status codes as intent, consistent error responses, what a consumer actually needs

Scenarios tied to chess app:
- `players-api` — Build the Players endpoint. What methods? What does the response shape look like?
- `games-api` — Build the Games endpoint. How do you scope games to a player? What does pagination look like?
- `analyses-api` — Serve analyses. How do you handle the per-game vs aggregate distinction in the API?

---

### Phase 4: Background Jobs — "Work that happens later"
Goal: understand why async processing exists and how to think about job design, failure, and retries.

Sections:
- **Why async** — what blocking a web request means, when you'd reach for a background job vs just doing it inline
  - mentalModelHook: "A background job is a note you leave for yourself. The request handler drops the note and walks away."
  - analogies: ["Background job as a postal service — you hand off the package, the post office handles delivery and retries"]
- **Sidekiq and Redis** — what Redis is doing here (job queue), what Sidekiq adds, how to reason about workers and concurrency
- **Job design** — idempotency, what happens when a job runs twice, how to design jobs that are safe to retry

Scenarios tied to chess app:
- `sync-games-job` — Build the job that fetches games from chess.com. What arguments does it take? How do you avoid re-importing duplicates?
- `analyze-game-job` — Build the job that sends a game to Claude. What's the input? How do you store the result?

---

### Phase 5: External API Consumption — "Talking to services you don't control"
Goal: build the habit of reading API docs carefully, handling failure gracefully, and not trusting external data.

Sections:
- **HTTP clients in Rails** — Faraday vs Net::HTTP, when to wrap an API client in a service object
  - mentalModelHook: "An external API is a dependency you can't deploy. Design your code to tolerate it being slow, down, or wrong."
- **Error handling** — network failures, unexpected response shapes, rate limits
- **Service objects** — why you'd extract API calls out of jobs/models, what a service object is and when it earns its keep

Scenarios tied to chess app:
- `chess-com-client` — Build a service object that wraps the chess.com API. What methods does it expose? How does it handle errors?

---

### Phase 6: AI Integration — "Claude as a collaborator in your app"
Goal: understand the Claude API, prompt design, and structured responses.

Sections:
- **The Claude API** — messages, roles, tokens, what the API actually does when you call it
  - mentalModelHook: "The API doesn't remember you. Every call is stateless. You pass the full context every time."
- **Prompt design** — what makes a prompt produce reliable, parseable output vs freeform prose
- **Structured responses** — asking Claude for JSON, validating the shape, storing it as jsonb

Scenarios tied to chess app:
- `per-game-analysis` — Build the job that sends a game to Claude and stores structured analysis. What's the prompt? What shape is the response?
- `aggregate-analysis` — Build the aggregate style analysis. How do you summarize across many games without hitting token limits?
- `chess-chat` — Build the conversational interface. How do you pass context (game history, prior analysis) into each message?

---

### Phase 7: Frontend Integration — "Connecting React to your API"
Goal: understand how a React app consumes a Rails API — data fetching, state, and the shape of the contract.

Sections:
- **CORS and the API boundary** — why CORS exists, how to configure it in Rails, what it means for local development
- **Data fetching patterns** — when to fetch on mount vs on demand, loading/error states
- **Displaying chess data** — charting accuracy over time, rendering game lists, showing analysis

Scenarios tied to chess app:
- `dashboard` — Build the React dashboard. What does it fetch? How does it handle loading states?
- `game-detail` — Build the game detail view. How do you render per-game analysis?

---

### Phase 8: Deployment — "Getting it running somewhere else"
Goal: understand what changes when code leaves your machine.

Sections:
- **Environment config** — what env vars are, why credentials can't be in code, how Rails manages environments
- **Render setup** — web service, worker process, managed PostgreSQL and Redis, how they connect
- **Production concerns** — what to check before deploying, what "it works locally" doesn't guarantee

Scenarios tied to chess app:
- `deploy-to-render` — Deploy the full stack. What services do you need? What env vars? How do you verify it's working?

---

## Check My Work Flow

1. Learner completes a scenario in the chess app
2. The platform detects relevant files have changed (or learner clicks "Check my work")
3. The platform reads those files from the configured local path and sends them to Claude along with the scenario's `prompt.md` rubric
4. Returns: what's covered, what's missing, one follow-up question to deepen understanding

The evaluator prompt format mirrors `system-design-for-humans` — a rubric checklist and a JSON response shape (`covered`, `missed`, `followUp`).

Each `prompt.md` specifies which files to read relative to the chess app root (e.g., `app/models/game.rb`, `db/schema.rb`). The platform resolves these against the configured local path and includes their content in the Claude API call automatically.

### Settings: Local Project Path

Mirrors the API key pattern in `system-design-for-humans` — stored in localStorage, editable from a settings page.

- User sets the absolute path to their chess app once (e.g., `/Users/snesjhon/Developer/chess-learning`)
- Platform stores it in localStorage under `chessAppPath`
- On each scenario view, the platform polls for changes to the files listed in `prompt.md` and surfaces a "New changes detected — check your work?" prompt automatically
- No manual file-pointing needed after initial setup

---

## Chess App (Separate Project)

**Stack:** Rails 7 API mode, PostgreSQL, Sidekiq + Redis, React (Vite), deployed on Render

**What it does:**
- Syncs games from chess.com public API (no auth required)
- Stores games, accuracy scores, and move data
- Runs Claude analysis per-game and in aggregate
- Serves a React dashboard with stats, game history, and analysis
- Provides a chat interface for asking Claude about your games
- Generates tailored chess lessons based on your patterns

The chess app is purely a vehicle for the curriculum. Its features are scoped to what teaches the backend concepts — not an exhaustive chess platform.

---

## Out of Scope

- Authentication/user accounts (single-player app, one chess.com username)
- Real-time features (WebSockets, live game updates)
- Mobile app
- Chess engine integration (Stockfish) — chess.com provides accuracy scores directly
- Social features

---

## Platform App Structure (fullstack-design-for-humans)

Mirrors `system-design-for-humans`:

```
apps/fullstack-design-for-humans/
  lib/
    journey.ts          # phases, sections, scenarios
    types.ts
    content.ts
  app/
    scenarios/{slug}/
      brief.md          # what to build
      walkthrough.md    # mental models, analogies, step-by-step
      prompt.md         # evaluator rubric for Claude
  docs/
    00-complete-fullstack-path.md
  .claude/
    skills/
      fullstack-scenario/SKILL.md   # generates new scenarios
```
