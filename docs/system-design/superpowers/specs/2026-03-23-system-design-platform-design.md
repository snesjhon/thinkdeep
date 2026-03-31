# System Design for Humans — Platform Design

**Date**: 2026-03-23
**Status**: Approved

---

## Overview

A Next.js 14 learning platform for system design, structured identically to `dsa-for-humans`. Teaches system design from first principles (fundamentals) through applied practice (scenarios), with an AI evaluator at every level. Primary goal: interview prep. Secondary goal: a reference users return to.

The core philosophy mirrors dsa-for-humans: **fundamentals first, application second**. The failure mode being solved is knowing *what* concepts are without being able to reason from them under pressure.

---

## Curriculum Structure

Three phases defined in `lib/journey.ts`, same data shape as dsa-for-humans.

### Phase 1 — Novice (Foundations)
- Data Modeling & Schema Design
- API Design (REST, resources, status codes, versioning)
- Relational Databases (SQL, indexes, constraints, joins)
- Caching Fundamentals
- Scalability Fundamentals (vertical vs horizontal, stateless services)

### Phase 2 — Studied (Distributed Systems)
- Database Scaling (replication, sharding, partitioning)
- Consistent Hashing
- Message Queues & Async Processing
- CAP Theorem & Consistency Models
- Rate Limiting
- Storage & CDN

### Phase 3 — Expert (Complex Systems)
- Distributed Transactions
- Real-time Systems (WebSockets, SSE, polling trade-offs)
- Search Systems
- Observability & Monitoring
- Microservices vs Monolith trade-offs

Each section has: a fundamentals guide + first-pass scenarios + reinforce scenarios (same `JourneySection` shape as dsa-for-humans, with `scenarios` replacing `problems`).

---

## Page Types

### Fundamentals pages (`/fundamentals/[slug]`)
- Deep-dive markdown guide, prose-first
- Mermaid diagrams for architecture and concept maps (replaces trace components and StackBlitz from dsa-for-humans — no code execution)
- **AI Evaluator** embedded at the bottom — scoped to conceptual recall of this topic

### Scenario pages (`/scenarios/[slug]`)
- Requirements brief (like a real interview handoff — see frozen yogurt ordering system as canonical example)
- Concepts panel: links back to the fundamentals sections this scenario exercises
- **AI Evaluator** — scoped to full design challenge for this scenario

### Path page (`/path`)
- Same two-column layout as dsa-for-humans: guide card on left, practice scenarios on right
- Phase zones with color gradients
- First-pass + reinforce scenario links per section

---

## AI Evaluator

The evaluator is a single shared component (`components/Evaluator.tsx`) used on both fundamentals and scenario pages. Each page has a corresponding `prompt.md` that defines the rubric and scope for that specific page.

### Flow
1. User speaks their answer using an external STT app
2. User pastes the transcript into the evaluator text area
3. User submits — client makes a direct call to the Claude API
4. Claude returns structured feedback: what was covered, what was missed, one focused follow-up question if there's a clear gap
5. **Single exchange** — not a conversation. User can retry as many times as they want.

### Scope guardrails (baked into each `prompt.md`)
- Only evaluate what the rubric covers — do not expand the topic
- If the user's answer goes beyond scope, redirect them back
- Phase-aware: novice answers and expert answers are graded differently

### `Evaluator.tsx` interface

```typescript
interface EvaluatorProps {
  promptContent: string;  // contents of the page's prompt.md, loaded server-side and passed as prop
  phase: number;          // 1 | 2 | 3 — passed to Claude to calibrate grading depth
}
```

The page loads `prompt.md` at build time (same pattern as `readMarkdownFile` in dsa-for-humans) and passes the content as a prop. The component holds textarea state client-side. On submit:
- Reads API key from localStorage (errors gracefully if missing, links to `/settings`)
- Calls Claude API directly from the browser (`claude-sonnet-4-6` model)
- Message: system = `promptContent`, user = transcript text
- Expects a structured JSON response: `{ covered: string[], missed: string[], followUp: string | null }`
- Displays feedback inline below the textarea

Errors (missing key, API failure) are shown inline — no page navigation.

### API key
- Users bring their own Claude API key
- Stored in `localStorage` via `lib/apiKey.ts`
- Entered once via `/settings` page — shows masked key if already set, with a clear action
- No key validation on save (validation happens implicitly on first evaluator call)
- All Claude API calls are made client-side — no backend proxy

### Future improvement
- Back-and-forth conversation mode (Claude asks follow-up, user responds) — deferred until single-exchange mode is validated

---

## Content Generation (Skills)

Content is **not pre-written in bulk**. Two Claude skills generate content on demand, to be refined iteratively before scaling.

### `system-fundamentals` skill
- Input: topic name (e.g. `Data Modeling`, `Consistent Hashing`)
- Reads `lib/journey.ts` to find the matching section
- Generates:
  - `app/fundamentals/{slug}/{slug}-fundamentals.md` — the guide (prose + mermaid diagrams, no code)
  - `app/fundamentals/{slug}/prompt.md` — AI evaluator system prompt scoped to this concept
- Wires `fundamentalsSlug` and `fundamentalsBlurb` into `journey.ts`

### `system-scenario` skill
- Input: scenario name + target section + pass type (e.g. `Design a URL Shortener` / `Caching Fundamentals` / `firstPass`)
- `pass type` is an explicit user-provided parameter (`firstPass` or `reinforce`) — the skill does not infer it
- Generates:
  - `app/scenarios/{slug}/brief.md` — the requirements spec (functional requirements, constraints, scale hints)
  - `app/scenarios/{slug}/prompt.md` — AI evaluator system prompt (rubric, scope boundary, phase level)
- Wires scenario slug into `journey.ts` under the right section's `firstPass` or `reinforce`

Both skills: refine the skill first with 1-2 examples, then scale to full curriculum.

---

## Technical Architecture

New standalone repo. Same stack as dsa-for-humans: Next.js 14, TypeScript, Tailwind, Vercel.

```
lib/journey.ts              → phases, sections, scenario slugs (first-pass + reinforce)
lib/content.ts              → loads scenario briefs from app/scenarios/
lib/fundamentals.ts         → loads guides from app/fundamentals/
lib/apiKey.ts               → get/set Claude API key in localStorage

app/path/                   → the journey view (same layout as dsa-for-humans)
app/fundamentals/[slug]/    → fundamentals guide + evaluator
app/scenarios/[slug]/       → scenario brief + concepts panel + evaluator
app/settings/               → API key entry/update
app/page.tsx                → homepage

components/Evaluator.tsx    → shared evaluator UI (textarea, submit, feedback display)

app/fundamentals/{slug}/
  {slug}-fundamentals.md    → the guide
  prompt.md                 → evaluator system prompt

app/scenarios/{slug}/
  brief.md                  → requirements spec
  prompt.md                 → evaluator system prompt
```

### Data shape (`journey.ts`)

`patternIds` is intentionally removed — there are no cross-cutting pattern guide pages in this platform. Each section is self-contained via its fundamentals guide.

The `JourneySection` type gains `scenarios` replacing `problems`. `isFirstPass` is dropped from the scenario item — membership in `firstPass` vs `reinforce` array is sufficient:

```typescript
interface JourneyScenario {
  slug: string;           // e.g. "design-url-shortener"
  label: string;          // human-readable display title, e.g. "Design a URL Shortener"
  relatedFundamentalsSlugs: string[]; // powers the Concepts panel on the scenario page
}

interface JourneySection {
  id: string;
  label: string;
  mentalModelHook: string;
  analogies: string[];
  fundamentalsSlug?: string;
  fundamentalsBlurb?: string;
  firstPass: JourneyScenario[];
  reinforce: JourneyScenario[];
}
```

Scenario display titles come from `JourneyScenario.label` in `journey.ts` — not inferred from slugs or frontmatter. `lib/content.ts` loads `brief.md` and `prompt.md` for a given slug; the title is passed in from the journey data by the page.

---

## CLAUDE.md

The repo ships with a `CLAUDE.md` from day one documenting:
- Content paths (`app/fundamentals/`, `app/scenarios/`)
- The two skills and how to invoke them
- `lib/journey.ts` as source of truth for the curriculum
- Dev commands

---

## What Ships First

The platform launches with scaffold + 1 hand-crafted example of each content type:
- 1 fundamentals guide (Data Modeling & Schema Design)
- 1 scenario (Yogurt Ordering System — the frozen yogurt API design from the interview)

Both include their `prompt.md` files. The skills are then refined against these examples before generating more content.
