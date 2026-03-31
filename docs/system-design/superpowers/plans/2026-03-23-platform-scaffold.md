# System Design for Humans — Platform Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the full system-design-for-humans Next.js platform with data layer, all pages, the AI evaluator component, seed content for one fundamentals guide + one scenario, and two Claude skills for content generation.

**Architecture:** Standalone Next.js 14 app mirroring dsa-for-humans structure. `lib/journey.ts` is the curriculum source of truth. Content lives as markdown files in `app/fundamentals/` and `app/scenarios/`. The AI evaluator is a client component that calls Claude API directly from the browser using the user's own API key stored in localStorage.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS 3, gray-matter, react-markdown, remark-gfm, rehype-highlight, mermaid, @anthropic-ai/sdk, pnpm

**Prerequisites:** `docs/00-complete-system-design-path.md` already exists in the repo — both skills read it for topic context. Do not recreate it.

**Note on testing:** This is a content-driven static Next.js site with no unit test suite. Verification steps are "run `pnpm dev` and confirm in browser" rather than automated tests. Follow each implementation step with the verification step before moving on.

**Reference project:** `/Users/snesjhon/Developer/dsa-for-humans` — read files from here freely to match patterns. Do not modify it.

---

## File Map

```
system-design-for-humans/
├── CLAUDE.md                                      ← project guide for Claude sessions
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.mjs
├── next-env.d.ts
├── .gitignore
│
├── lib/
│   ├── journey.ts                                 ← curriculum source of truth (phases, sections, scenarios)
│   ├── content.ts                                 ← loads scenario brief.md + prompt.md
│   ├── fundamentals.ts                            ← loads fundamentals guide + prompt.md
│   ├── apiKey.ts                                  ← localStorage get/set/clear for Claude API key
│   └── types.ts                                   ← shared TypeScript interfaces
│
├── components/
│   └── Evaluator.tsx                              ← shared AI evaluator UI (client component)
│
├── app/
│   ├── layout.tsx                                 ← root layout with fonts + metadata
│   ├── page.tsx                                   ← homepage (redirect to /path)
│   ├── globals.css                                ← CSS variables + base styles
│   │
│   ├── path/
│   │   └── page.tsx                               ← the learning journey view
│   │
│   ├── fundamentals/
│   │   └── [slug]/
│   │       └── page.tsx                           ← fundamentals guide + evaluator
│   │
│   ├── scenarios/
│   │   └── [slug]/
│   │       └── page.tsx                           ← scenario brief + concepts panel + evaluator
│   │
│   └── settings/
│       └── page.tsx                               ← API key management
│
├── app/fundamentals/data-modeling/               ← seed content: first fundamentals guide
│   ├── data-modeling-fundamentals.md
│   └── prompt.md
│
└── app/scenarios/yogurt-ordering-system/         ← seed content: first scenario
    ├── brief.md
    └── prompt.md
│
└── .claude/
    └── skills/
        ├── system-fundamentals/
        │   └── SKILL.md                           ← skill to generate fundamentals guides
        └── system-scenario/
            └── SKILL.md                           ← skill to generate scenario briefs + prompts
```

---

## Task 1: Project scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `next.config.mjs`
- Create: `.gitignore`
- Create: `next-env.d.ts`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "system-design-for-humans",
  "version": "0.1.0",
  "private": true,
  "packageManager": "pnpm@10.32.1",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.36.3",
    "framer-motion": "^12.38.0",
    "gray-matter": "^4.0.3",
    "mermaid": "^11.13.0",
    "next": "14.2.5",
    "react": "^18",
    "react-dom": "^18",
    "react-markdown": "^9.0.1",
    "rehype-highlight": "^7.0.0",
    "remark-gfm": "^4.0.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

Copy from `/Users/snesjhon/Developer/dsa-for-humans/tsconfig.json` verbatim — identical stack.

- [ ] **Step 3: Create `tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: { extend: {} },
  plugins: [],
}
export default config
```

- [ ] **Step 4: Create `postcss.config.js`**

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 5: Create `next.config.mjs`**

No COOP/COEP headers needed (no WebContainers). Keep it minimal:

```javascript
const nextConfig = {}
export default nextConfig
```

- [ ] **Step 6: Create `.gitignore`**

Copy from `/Users/snesjhon/Developer/dsa-for-humans/.gitignore` verbatim.

- [ ] **Step 7: Create `next-env.d.ts`**

```typescript
/// <reference types="next" />
/// <reference types="next/image-types/global" />
```

- [ ] **Step 8: Install dependencies**

```bash
cd /Users/snesjhon/Developer/system-design-for-humans
pnpm install
```

Expected: `node_modules/` created, no errors.

---

## Task 2: Types + `lib/journey.ts`

**Files:**
- Create: `lib/types.ts`
- Create: `lib/journey.ts`

- [ ] **Step 1: Create `lib/types.ts`**

```typescript
export interface JourneyScenario {
  slug: string                        // "design-url-shortener"
  label: string                       // "Design a URL Shortener"
  relatedFundamentalsSlugs: string[]  // ["caching-fundamentals", "scalability-fundamentals"]
}

export interface JourneySection {
  id: string
  label: string
  mentalModelHook: string
  analogies: string[]
  fundamentalsSlug?: string
  fundamentalsBlurb?: string
  firstPass: JourneyScenario[]
  reinforce: JourneyScenario[]
}

export interface Phase {
  number: number
  label: string
  emoji: string
  goal: string
  sections: JourneySection[]
}
```

- [ ] **Step 2: Create `lib/journey.ts` — Phase 1 sections**

```typescript
import type { Phase, JourneySection } from './types'

export type { JourneyScenario, JourneySection, Phase } from './types'

export const JOURNEY: Phase[] = [
  // ─────────────────────────────────────────────────────────────────
  // PHASE 1: NOVICE
  // ─────────────────────────────────────────────────────────────────
  {
    number: 1,
    label: 'Novice',
    emoji: '🌱',
    goal: 'Build foundational design intuition with systems you can visualize and reason about concretely.',
    sections: [
      {
        id: 'data-modeling',
        label: 'Data Modeling & Schema Design',
        mentalModelHook: 'Every system is just entities and relationships. Before you think about scale, think about what you\'re storing and why.',
        analogies: ['Entities as nouns, relationships as verbs', 'Schema as a contract with the future'],
        fundamentalsSlug: 'data-modeling',
        fundamentalsBlurb: 'Entity identification, relationship mapping, normalization trade-offs, and constraints as data integrity guarantees — before any system can scale, it needs a solid schema.',
        firstPass: [
          {
            slug: 'yogurt-ordering-system',
            label: 'Design a Yogurt Ordering System',
            relatedFundamentalsSlugs: ['data-modeling'],
          },
        ],
        reinforce: [],
      },
      {
        id: 'api-design',
        label: 'API Design',
        mentalModelHook: 'An API is a contract between you and your consumers. Design for the consumer, not the implementation.',
        analogies: ['REST resources as nouns, methods as verbs', 'Status codes as intent, not just numbers'],
        firstPass: [],
        reinforce: [],
      },
      {
        id: 'relational-databases',
        label: 'Relational Databases',
        mentalModelHook: 'Tables are truth. Indexes are shortcuts. Joins are the price you pay for normalization.',
        analogies: ['Index as a book\'s index — lookup first, read second', 'Transaction as an all-or-nothing promise'],
        firstPass: [],
        reinforce: [],
      },
      {
        id: 'caching-fundamentals',
        label: 'Caching Fundamentals',
        mentalModelHook: 'A cache is a bet — you\'re trading consistency for speed. Know what you\'re willing to lose.',
        analogies: ['Cache as a sticky note on your desk vs filing cabinet', 'TTL as an expiry date on food'],
        firstPass: [],
        reinforce: [],
      },
      {
        id: 'scalability-fundamentals',
        label: 'Scalability Fundamentals',
        mentalModelHook: 'Stateless services scale horizontally. State is the hard part.',
        analogies: ['Horizontal scaling as adding more cashiers', 'Stateless as a vending machine vs a personal shopper'],
        firstPass: [],
        reinforce: [],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // PHASE 2: STUDIED
  // ─────────────────────────────────────────────────────────────────
  {
    number: 2,
    label: 'Studied',
    emoji: '📚',
    goal: 'Think in distributed systems. Reason about trade-offs under scale, failure, and concurrency.',
    sections: [
      {
        id: 'database-scaling',
        label: 'Database Scaling',
        mentalModelHook: 'You scale reads first (replicas), then writes (sharding). Never shard before you have to.',
        analogies: ['Read replica as a photocopied menu at a busy restaurant', 'Shard key as a library\'s Dewey Decimal system'],
        firstPass: [],
        reinforce: [],
      },
      {
        id: 'consistent-hashing',
        label: 'Consistent Hashing',
        mentalModelHook: 'When your hash space is fixed, adding or removing nodes reshuffles every key. Consistent hashing limits that chaos to neighbors only.',
        analogies: ['Hash ring as a clock face — nodes sit at positions, keys find the next clockwise node'],
        firstPass: [],
        reinforce: [],
      },
      {
        id: 'message-queues',
        label: 'Message Queues & Async Processing',
        mentalModelHook: 'A queue decouples the producer from the consumer. You send a message and forget — the queue handles delivery.',
        analogies: ['Queue as a postal service — drop the letter, walk away', 'Dead letter queue as the undeliverable mail pile'],
        firstPass: [],
        reinforce: [],
      },
      {
        id: 'cap-theorem',
        label: 'CAP Theorem & Consistency Models',
        mentalModelHook: 'When the network partitions, you must choose: serve stale data or refuse to answer. There is no third option.',
        analogies: ['CP as a bank that closes rather than risk a bad balance', 'AP as a scoreboard that might be a second behind'],
        firstPass: [],
        reinforce: [],
      },
      {
        id: 'rate-limiting',
        label: 'Rate Limiting',
        mentalModelHook: 'Rate limiting protects resources from being overwhelmed. You\'re not rejecting users — you\'re enforcing fairness.',
        analogies: ['Token bucket as a bucket that refills at a fixed rate', 'Sliding window as a moving snapshot of recent requests'],
        firstPass: [],
        reinforce: [],
      },
      {
        id: 'storage-cdn',
        label: 'Storage & CDN',
        mentalModelHook: 'CDNs move data closer to users. Storage tiers match access frequency. Hot data costs more to store fast.',
        analogies: ['CDN edge node as a convenience store near your house vs a warehouse far away', 'Object storage as infinite cheap shelving'],
        firstPass: [],
        reinforce: [],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // PHASE 3: EXPERT
  // ─────────────────────────────────────────────────────────────────
  {
    number: 3,
    label: 'Expert',
    emoji: '🎯',
    goal: 'Combine Phase 1 and Phase 2 concepts into complex, production-grade systems.',
    sections: [
      {
        id: 'distributed-transactions',
        label: 'Distributed Transactions',
        mentalModelHook: 'ACID is easy on one machine. On multiple machines, you orchestrate it yourself.',
        analogies: ['Two-phase commit as getting two people to agree to meet before either leaves home', 'Saga as a series of reversible steps with compensating actions'],
        firstPass: [],
        reinforce: [],
      },
      {
        id: 'real-time-systems',
        label: 'Real-time Systems',
        mentalModelHook: 'Real-time is a spectrum. Polling is lazy pull. WebSockets is a persistent connection. SSE is a one-way stream.',
        analogies: ['Polling as checking your mailbox every hour', 'WebSocket as a phone call that stays open', 'SSE as a radio broadcast'],
        firstPass: [],
        reinforce: [],
      },
      {
        id: 'search-systems',
        label: 'Search Systems',
        mentalModelHook: 'Full-text search is an inverted index — you look up words to find documents, not documents to find words.',
        analogies: ['Inverted index as a book\'s index at the back — look up the word, find the page'],
        firstPass: [],
        reinforce: [],
      },
      {
        id: 'observability',
        label: 'Observability & Monitoring',
        mentalModelHook: 'You can\'t fix what you can\'t see. Logs are events, metrics are trends, traces are journeys.',
        analogies: ['Logs as a diary, metrics as a dashboard, traces as a GPS breadcrumb trail'],
        firstPass: [],
        reinforce: [],
      },
      {
        id: 'microservices',
        label: 'Microservices vs Monolith',
        mentalModelHook: 'Microservices trade operational simplicity for deployment flexibility. Only split when the monolith\'s coupling is hurting you.',
        analogies: ['Monolith as one big Swiss Army knife vs microservices as a toolbox of specialized tools'],
        firstPass: [],
        reinforce: [],
      },
    ],
  },
]

export function getSectionById(sectionId: string): JourneySection | undefined {
  for (const phase of JOURNEY) {
    const section = phase.sections.find(s => s.id === sectionId)
    if (section) return section
  }
  return undefined
}

export function getPhaseForSection(sectionId: string): Phase | undefined {
  return JOURNEY.find(phase => phase.sections.some(s => s.id === sectionId))
}

export function getAllSectionIds(): string[] {
  return JOURNEY.flatMap(phase => phase.sections.map(s => s.id))
}

export function getAllScenarioSlugs(): string[] {
  return JOURNEY.flatMap(phase =>
    phase.sections.flatMap(section => [
      ...section.firstPass.map(s => s.slug),
      ...section.reinforce.map(s => s.slug),
    ])
  )
}

export function getScenarioBySlug(slug: string) {
  for (const phase of JOURNEY) {
    for (const section of phase.sections) {
      const scenario =
        section.firstPass.find(s => s.slug === slug) ||
        section.reinforce.find(s => s.slug === slug)
      if (scenario) return { scenario, section, phase }
    }
  }
  return null
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/snesjhon/Developer/system-design-for-humans
npx tsc --noEmit
```

Expected: no errors.

---

## Task 3: `lib/content.ts` and `lib/fundamentals.ts`

**Files:**
- Create: `lib/content.ts`
- Create: `lib/fundamentals.ts`

- [ ] **Step 1: Create `lib/content.ts`**

```typescript
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const SCENARIOS_DIR = path.join(process.cwd(), 'app', 'scenarios')

export interface ScenarioContent {
  slug: string
  brief: string           // parsed markdown content from brief.md
  promptContent: string   // raw content of prompt.md (passed to Evaluator)
}

export function loadScenario(slug: string): ScenarioContent | null {
  const dir = path.join(SCENARIOS_DIR, slug)
  const briefPath = path.join(dir, 'brief.md')
  const promptPath = path.join(dir, 'prompt.md')

  if (!fs.existsSync(briefPath) || !fs.existsSync(promptPath)) return null

  const { content: brief } = matter(fs.readFileSync(briefPath, 'utf-8'))
  const promptContent = fs.readFileSync(promptPath, 'utf-8')

  return { slug, brief, promptContent }
}

export function getAllScenarioSlugsFromDisk(): string[] {
  if (!fs.existsSync(SCENARIOS_DIR)) return []

  return fs
    .readdirSync(SCENARIOS_DIR, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name !== '[slug]')
    .filter(entry => fs.existsSync(path.join(SCENARIOS_DIR, entry.name, 'brief.md')))
    .map(entry => entry.name)
}
```

- [ ] **Step 2: Create `lib/fundamentals.ts`**

```typescript
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { JOURNEY } from './journey'
import type { JourneySection, Phase } from './types'

const FUNDAMENTALS_DIR = path.join(process.cwd(), 'app', 'fundamentals')

export interface FundamentalsGuide {
  slug: string
  title: string
  content: string   // parsed markdown content
  promptContent: string  // raw content of prompt.md
}

function extractTitle(content: string, fallback: string): string {
  const match = content.match(/^#\s+(.+)$/m)
  return match ? match[1] : fallback
}

export function getFundamentalsGuide(slug: string): FundamentalsGuide | null {
  const dir = path.join(FUNDAMENTALS_DIR, slug)
  const guidePath = path.join(dir, `${slug}-fundamentals.md`)
  const promptPath = path.join(dir, 'prompt.md')

  if (!fs.existsSync(guidePath) || !fs.existsSync(promptPath)) return null

  const { content } = matter(fs.readFileSync(guidePath, 'utf-8'))
  const promptContent = fs.readFileSync(promptPath, 'utf-8')

  return {
    slug,
    title: extractTitle(content, slug.replace(/-/g, ' ')),
    content,
    promptContent,
  }
}

export function getAllFundamentalsSlugs(): string[] {
  if (!fs.existsSync(FUNDAMENTALS_DIR)) return []

  return fs
    .readdirSync(FUNDAMENTALS_DIR, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name !== '[slug]')
    .filter(entry =>
      fs.existsSync(path.join(FUNDAMENTALS_DIR, entry.name, `${entry.name}-fundamentals.md`))
    )
    .map(entry => entry.name)
}

export function getSectionForFundamentals(slug: string): { phase: Phase; section: JourneySection } | null {
  for (const phase of JOURNEY) {
    for (const section of phase.sections) {
      if (section.fundamentalsSlug === slug) return { phase, section }
    }
  }
  return null
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 4: `lib/apiKey.ts`

**Files:**
- Create: `lib/apiKey.ts`

- [ ] **Step 1: Create `lib/apiKey.ts`**

```typescript
const API_KEY_STORAGE_KEY = 'sdh_claude_api_key'

export function getApiKey(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(API_KEY_STORAGE_KEY)
}

export function setApiKey(key: string): void {
  localStorage.setItem(API_KEY_STORAGE_KEY, key)
}

export function clearApiKey(): void {
  localStorage.removeItem(API_KEY_STORAGE_KEY)
}

export function maskApiKey(key: string): string {
  if (key.length <= 8) return '••••••••'
  return key.slice(0, 7) + '••••••••' + key.slice(-4)
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

---

## Task 5: App shell — layout, global styles, homepage

**Files:**
- Create: `app/globals.css`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`

- [ ] **Step 1: Create `app/globals.css`**

Reference `/Users/snesjhon/Developer/dsa-for-humans/app/globals.css` for the CSS variable palette (colors, fonts, spacing). Copy the CSS variable definitions and base styles. Remove any StackBlitz/WebContainer-specific styles.

- [ ] **Step 2: Create `app/layout.tsx`**

```typescript
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'System Design for Humans',
  description: 'Learn system design from first principles — fundamentals first, scenarios second.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: Create `app/page.tsx`**

Simple redirect to `/path`:

```typescript
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/path')
}
```

- [ ] **Step 4: Create placeholder `app/path/page.tsx`** (will be replaced in Task 6)

```typescript
export default function PathPage() {
  return <main><p>Path coming soon</p></main>
}
```

- [ ] **Step 5: Run dev server and verify**

```bash
pnpm dev
```

Open `http://localhost:3000`. Expected: redirects to `/path`, shows "Path coming soon". No console errors.

---

## Task 6: `app/path/page.tsx`

**Files:**
- Modify: `app/path/page.tsx`

Reference `/Users/snesjhon/Developer/dsa-for-humans/app/path/page.tsx` for the phase zone layout, color system, and two-column grid pattern. Adapt it for scenarios instead of problems.

- [ ] **Step 1: Implement `app/path/page.tsx`**

Key differences from dsa-for-humans:
- Import from `lib/journey.ts` (same shape, different data)
- Left column: guide card links to `/fundamentals/[fundamentalsSlug]` (same as dsa-for-humans)
- Right column: lists `section.firstPass` scenario links to `/scenarios/[slug]` + `section.reinforce` scenario links
- Scenario items show `scenario.label` as the link text (not a numeric ID)
- No `problemMap` lookup needed — labels come from the journey data directly

```typescript
import Link from 'next/link'
import { JOURNEY, type JourneySection, type Phase } from '@/lib/journey'

const PHASE_COLORS = ['var(--purple)', 'var(--blue)', 'var(--green)', 'var(--orange)', 'var(--cyan)']
const pColor = (n: number) => PHASE_COLORS[(n - 1) % PHASE_COLORS.length]

// ... (mirror dsa-for-humans path page structure)
// StepGuideCard — links to /fundamentals/[slug]
// PlaceholderGuideCard — "Coming soon" when no fundamentalsSlug
// Scenario list — links to /scenarios/[slug] using scenario.label
// Phase zones with gradient backgrounds
```

- [ ] **Step 2: Verify in browser**

Open `http://localhost:3000/path`. Expected:
- Three phase zones (Novice, Studied, Expert) with color gradients
- All 16 sections visible, each with a label and mental model hook
- "Data Modeling & Schema Design" shows a "Read the guide →" card (fundamentalsSlug is set)
- All other sections show "Coming soon" guide card
- "Data Modeling" section shows "Design a Yogurt Ordering System" in its scenario list

---

## Task 7: `components/Evaluator.tsx`

**Files:**
- Create: `components/Evaluator.tsx`

This is the most novel component — no equivalent in dsa-for-humans. It is a `'use client'` component.

- [ ] **Step 1: Create `components/Evaluator.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { getApiKey } from '@/lib/apiKey'
import Anthropic from '@anthropic-ai/sdk'

interface EvaluatorProps {
  promptContent: string   // contents of the page's prompt.md
  phase: number           // 1 | 2 | 3
}

interface EvaluationResult {
  covered: string[]
  missed: string[]
  followUp: string | null
}

export default function Evaluator({ promptContent, phase }: EvaluatorProps) {
  const [transcript, setTranscript] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<EvaluationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    const apiKey = getApiKey()
    if (!apiKey) {
      setError('No API key set. Add your Claude API key in Settings.')
      return
    }
    if (!transcript.trim()) {
      setError('Paste your transcript before submitting.')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })

      const systemPrompt = `${promptContent}

Phase level: ${phase} (1=Novice, 2=Studied, 3=Expert). Calibrate your expectations accordingly.

Respond ONLY with valid JSON in this exact shape:
{
  "covered": ["point covered by the user", ...],
  "missed": ["important point not mentioned", ...],
  "followUp": "one focused follow-up question if there is a clear gap, or null"
}

Do not include any text outside the JSON object.`

      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: transcript }],
      })

      const text = message.content[0].type === 'text' ? message.content[0].text : ''
      const parsed: EvaluationResult = JSON.parse(text)
      setResult(parsed)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      setError(`Evaluation failed: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
      <h3 style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.7rem', fontWeight: 700,
        letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-gutter)', marginBottom: '1rem' }}>
        Evaluator
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--fg-comment)', marginBottom: '1rem' }}>
        Speak your answer, paste the transcript below, and get feedback.
      </p>

      <textarea
        value={transcript}
        onChange={e => setTranscript(e.target.value)}
        placeholder="Paste your transcript here..."
        rows={8}
        style={{ width: '100%', fontFamily: 'ui-monospace, monospace', fontSize: '0.875rem',
          padding: '12px', borderRadius: '6px', border: '1px solid var(--border)',
          background: 'var(--bg-alt)', color: 'var(--fg)', resize: 'vertical',
          boxSizing: 'border-box' }}
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{ marginTop: '0.75rem', padding: '8px 20px', borderRadius: '6px',
          background: loading ? 'var(--bg-highlight)' : 'var(--purple)',
          color: loading ? 'var(--fg-gutter)' : 'white',
          fontSize: '0.875rem', fontWeight: 600, border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
        {loading ? 'Evaluating…' : 'Submit for feedback'}
      </button>

      {error && (
        <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--red, #e06c75)' }}>
          {error}{' '}
          {error.includes('API key') && (
            <a href="/settings" style={{ color: 'var(--purple)' }}>Go to Settings →</a>
          )}
        </p>
      )}

      {result && (
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {result.covered.length > 0 && (
            <div>
              <p style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.65rem', fontWeight: 700,
                letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: '0.5rem' }}>
                Covered
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                {result.covered.map((item, i) => (
                  <li key={i} style={{ fontSize: '0.875rem', color: 'var(--fg)', marginBottom: '0.25rem' }}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {result.missed.length > 0 && (
            <div>
              <p style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.65rem', fontWeight: 700,
                letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: '0.5rem' }}>
                Missed
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                {result.missed.map((item, i) => (
                  <li key={i} style={{ fontSize: '0.875rem', color: 'var(--fg)', marginBottom: '0.25rem' }}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {result.followUp && (
            <div style={{ padding: '12px 16px', borderRadius: '6px', background: 'var(--bg-alt)',
              border: '1px solid var(--border)' }}>
              <p style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.65rem', fontWeight: 700,
                letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '0.5rem' }}>
                Follow-up
              </p>
              <p style={{ fontSize: '0.9375rem', color: 'var(--fg)', margin: 0, fontStyle: 'italic' }}>
                {result.followUp}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

---

## Task 8: `app/settings/page.tsx`

**Files:**
- Create: `app/settings/page.tsx`

- [ ] **Step 1: Create `app/settings/page.tsx`**

```typescript
'use client'

import { useState, useEffect } from 'react'
import { getApiKey, setApiKey, clearApiKey, maskApiKey } from '@/lib/apiKey'

export default function SettingsPage() {
  const [stored, setStored] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setStored(getApiKey())
  }, [])

  function handleSave() {
    if (!input.trim()) return
    setApiKey(input.trim())
    setStored(input.trim())
    setInput('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleClear() {
    clearApiKey()
    setStored(null)
  }

  return (
    <main style={{ maxWidth: '600px', margin: '80px auto', padding: '0 24px' }}>
      <h1 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.5rem' }}>Settings</h1>
      <p style={{ color: 'var(--fg-comment)', marginBottom: '2rem', fontSize: '0.9375rem' }}>
        Your API key is stored in your browser only. It never leaves your device.
      </p>

      {stored && (
        <div style={{ marginBottom: '1.5rem', padding: '12px 16px', borderRadius: '6px',
          background: 'var(--bg-alt)', border: '1px solid var(--border)', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.875rem', color: 'var(--fg)' }}>
            {maskApiKey(stored)}
          </span>
          <button onClick={handleClear} style={{ fontSize: '0.8rem', color: 'var(--fg-gutter)',
            background: 'none', border: 'none', cursor: 'pointer' }}>
            Clear
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="password"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={stored ? 'Replace API key…' : 'sk-ant-…'}
          style={{ flex: 1, padding: '8px 12px', borderRadius: '6px',
            border: '1px solid var(--border)', background: 'var(--bg-alt)',
            color: 'var(--fg)', fontSize: '0.875rem' }}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
        />
        <button onClick={handleSave} style={{ padding: '8px 20px', borderRadius: '6px',
          background: 'var(--purple)', color: 'white', fontWeight: 600,
          fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}>
          {saved ? 'Saved!' : 'Save'}
        </button>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Verify in browser**

Open `http://localhost:3000/settings`. Expected:
- Shows "No key set" state with input + Save button
- Enter a fake key, save — masked key appears above
- Clear button removes it

---

## Task 9: `app/fundamentals/[slug]/page.tsx`

**Files:**
- Create: `app/fundamentals/[slug]/page.tsx`

Reference `/Users/snesjhon/Developer/dsa-for-humans/app/fundamentals/[slug]/page.tsx` for the markdown rendering and table of contents pattern. Simplify: no StackBlitz, no WebContainer. Add Evaluator at the bottom.

- [ ] **Step 1: Create `app/fundamentals/[slug]/page.tsx`**

```typescript
import { notFound } from 'next/navigation'
import { getFundamentalsGuide, getAllFundamentalsSlugs, getSectionForFundamentals } from '@/lib/fundamentals'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import Evaluator from '@/components/Evaluator'

interface Props { params: { slug: string } }

export function generateStaticParams() {
  return getAllFundamentalsSlugs().map(slug => ({ slug }))
}

export default function FundamentalsPage({ params }: Props) {
  const guide = getFundamentalsGuide(params.slug)
  if (!guide) notFound()

  const match = getSectionForFundamentals(params.slug)
  const phase = match?.phase.number ?? 1

  return (
    <main style={{ maxWidth: '760px', margin: '0 auto', padding: '80px 24px' }}>
      <article>
        <MarkdownRenderer content={guide.content} />
      </article>
      <Evaluator promptContent={guide.promptContent} phase={phase} />
    </main>
  )
}
```

- [ ] **Step 2: Create `components/MarkdownRenderer.tsx`**

A simple client component that renders markdown using react-markdown + remark-gfm + rehype-highlight + mermaid:

```typescript
'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import MermaidChart from './MermaidChart'

interface Props { content: string }

export default function MarkdownRenderer({ content }: Props) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        code({ className, children }) {
          const lang = (className ?? '').replace('language-', '')
          if (lang === 'mermaid') {
            return <MermaidChart chart={String(children)} />
          }
          return <code className={className}>{children}</code>
        }
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
```

- [ ] **Step 3: Create `components/MermaidChart.tsx`**

```typescript
'use client'

import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

interface Props { chart: string }

let initialized = false

export default function MermaidChart({ chart }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!initialized) {
      mermaid.initialize({ startOnLoad: false, theme: 'dark' })
      initialized = true
    }
    if (ref.current) {
      const id = `mermaid-${Math.random().toString(36).slice(2)}`
      mermaid.render(id, chart).then(({ svg }) => {
        if (ref.current) ref.current.innerHTML = svg
      })
    }
  }, [chart])

  return <div ref={ref} style={{ margin: '1.5rem 0' }} />
}
```

- [ ] **Step 4: Verify in browser (after seed content is added in Task 11)**

Open `http://localhost:3000/fundamentals/data-modeling`. Expected: guide renders with mermaid diagrams, evaluator textarea visible at the bottom.

---

## Task 10: `app/scenarios/[slug]/page.tsx`

**Files:**
- Create: `app/scenarios/[slug]/page.tsx`

- [ ] **Step 1: Create `app/scenarios/[slug]/page.tsx`**

```typescript
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { loadScenario } from '@/lib/content'
import { getScenarioBySlug, getAllScenarioSlugs } from '@/lib/journey'
import { getSectionForFundamentals } from '@/lib/fundamentals'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import Evaluator from '@/components/Evaluator'

interface Props { params: { slug: string } }

export function generateStaticParams() {
  return getAllScenarioSlugs().map(slug => ({ slug }))
}

export default function ScenarioPage({ params }: Props) {
  const content = loadScenario(params.slug)
  if (!content) notFound()

  const match = getScenarioBySlug(params.slug)
  if (!match) notFound()

  const { scenario, section, phase } = match

  return (
    <main style={{ maxWidth: '760px', margin: '0 auto', padding: '80px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.65rem', fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-gutter)' }}>
          Phase {phase.number} · {section.label}
        </span>
        <h1 style={{ fontWeight: 800, fontSize: '2rem', marginTop: '0.5rem', marginBottom: 0 }}>
          {scenario.label}
        </h1>
      </div>

      {/* Concepts panel */}
      {scenario.relatedFundamentalsSlugs.length > 0 && (
        <div style={{ marginBottom: '2rem', padding: '16px', borderRadius: '8px',
          background: 'var(--bg-alt)', border: '1px solid var(--border)' }}>
          <p style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.65rem', fontWeight: 700,
            letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--fg-gutter)', marginBottom: '0.75rem' }}>
            Concepts this scenario exercises
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {scenario.relatedFundamentalsSlugs.map(slug => (
              <Link key={slug} href={`/fundamentals/${slug}`} style={{
                padding: '4px 12px', borderRadius: '999px', border: '1px solid var(--border)',
                fontSize: '0.8rem', color: 'var(--fg-alt)', textDecoration: 'none' }}>
                {slug.replace(/-/g, ' ')}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Brief */}
      <article>
        <MarkdownRenderer content={content.brief} />
      </article>

      {/* Evaluator */}
      <Evaluator promptContent={content.promptContent} phase={phase.number} />
    </main>
  )
}
```

- [ ] **Step 2: Verify in browser (after seed content in Task 12)**

Open `http://localhost:3000/scenarios/yogurt-ordering-system`. Expected: brief renders, concepts panel shows link to "data-modeling", evaluator visible at bottom.

---

## Task 11: Seed content — Data Modeling fundamentals

**Files:**
- Create: `app/fundamentals/data-modeling/data-modeling-fundamentals.md`
- Create: `app/fundamentals/data-modeling/prompt.md`

This is hand-crafted content — the canonical example that the `system-fundamentals` skill will later be trained against.

- [ ] **Step 1: Create `app/fundamentals/data-modeling/data-modeling-fundamentals.md`**

Write a focused fundamentals guide (aim for 15–25 min read time) covering:

**Required sections** (in this order):
1. `## Overview` — what data modeling is, why it matters before scale
2. `## Core Concept & Mental Model` — entities as nouns, relationships as verbs; the yogurt ordering system used as a running analogy
3. `## Building Blocks`
   - **Level 1: Entities and attributes** — identifying the things in your system
   - **Level 2: Relationships** — one-to-many, many-to-many, foreign keys
   - **Level 3: Constraints and integrity** — uniqueness, not-null, check constraints as guarantees
4. `## Key Patterns`
   - Normalization vs denormalization trade-off
   - Soft deletes
5. `## Decision Framework` — mermaid concept map + when to normalize vs denormalize
6. `## Common Gotchas` — 3-5 mistakes with explanations

**Rules:**
- Prose-first — explain concepts before showing any SQL
- Mermaid ER diagrams where helpful (use `erDiagram` syntax)
- No code blocks for implementation — diagrams only
- Keep the yogurt ordering system as the running example throughout

- [ ] **Step 2: Create `app/fundamentals/data-modeling/prompt.md`**

Write the AI evaluator system prompt for this topic. It should:
- Define scope: conceptual recall of data modeling fundamentals only
- Define the rubric (what a complete answer covers): entities, relationships, constraints, normalization trade-off
- Set scope boundary: redirect if user starts talking about distributed systems or caching
- Be phase-aware: novice = basic entity/relationship understanding; studied = normalization reasoning; expert = trade-off articulation
- Instruct Claude to respond ONLY with the JSON structure `{ covered, missed, followUp }`

Example prompt structure:
```
You are evaluating a learner's understanding of Data Modeling & Schema Design fundamentals.

## Scope
Only evaluate concepts within data modeling: entities, attributes, relationships (one-to-many, many-to-many), constraints (uniqueness, foreign keys, not-null), normalization vs denormalization. If the user discusses caching, scaling, or distributed systems, note this briefly and redirect.

## Rubric
A complete answer for Phase 1 (Novice) should cover:
- [ ] Identifying the main entities in a system
- [ ] Describing relationships between entities (one-to-many, many-to-many)
- [ ] Explaining at least one type of constraint and what it protects
- [ ] Mentioning the trade-off between normalization and denormalization

## Output
Respond ONLY with valid JSON: { "covered": [...], "missed": [...], "followUp": "..." or null }
```

- [ ] **Step 3: Verify fundamentals page renders**

```bash
pnpm dev
```

Open `http://localhost:3000/fundamentals/data-modeling`. Expected: full guide renders with mermaid diagrams, evaluator at bottom.

---

## Task 12: Seed content — Yogurt Ordering System scenario

**Files:**
- Create: `app/scenarios/yogurt-ordering-system/brief.md`
- Create: `app/scenarios/yogurt-ordering-system/prompt.md`

- [ ] **Step 1: Create `app/scenarios/yogurt-ordering-system/brief.md`**

Write the requirements spec exactly as it would appear in a real interview handout:

```markdown
# Design a Yogurt Ordering System

## Overview

Design the backend system for a frozen yogurt ordering application.

- A backend API and a separate frontend application
- Customers place orders through the app
- Employees manage and fulfill orders

## Functional Requirements

- Customers can choose a yogurt **size** (sizes have fixed prices)
- Customers can choose one **base yogurt flavor** per order
- Customers can add **toppings** to their order
  - Toppings are added by the scoop
  - Each topping has a **weight per scoop**
  - Any number and combination of toppings can be added
  - The yogurt itself does not contribute to weight
- Each order has a **maximum allowed weight** determined by the chosen size
- Toppings contribute to the order's total weight
- Employees can **update order statuses**
- Customers can **view their order status**

## What you should design

- The database schema
- The key API endpoints
- Any constraints or validation logic worth calling out
```

- [ ] **Step 2: Create `app/scenarios/yogurt-ordering-system/prompt.md`**

Write the AI evaluator system prompt for this scenario:

```
You are evaluating a learner's system design answer for the Yogurt Ordering System scenario.

## Scope
This is a Phase 1 (Novice) scenario focused on data modeling and API design. Evaluate:
- Schema design (entities, relationships, constraints)
- API design (endpoints, methods, request/response shape)
- Constraint logic (weight validation, one flavor per order)

Do not evaluate distributed systems concerns (caching, sharding, queues) — if the user raises these, note briefly that they're out of scope for this scenario and redirect.

## Rubric
A strong answer should cover:
- [ ] Core entities identified: Order, Size, Flavor, Topping, OrderTopping (junction)
- [ ] Weight constraint modeled correctly: max weight on Size, weight per scoop on Topping
- [ ] One-flavor-per-order constraint identified
- [ ] Order status as an enum or status field
- [ ] Key API endpoints: create order, add toppings, update status, get order
- [ ] Validation: weight check before order is confirmed

## Output
Respond ONLY with valid JSON: { "covered": [...], "missed": [...], "followUp": "..." or null }
```

- [ ] **Step 3: Verify scenario page renders**

Open `http://localhost:3000/scenarios/yogurt-ordering-system`. Expected: brief renders, concepts panel shows "data modeling" link, evaluator at bottom.

- [ ] **Step 4: End-to-end evaluator test**

1. Go to `/settings`, enter a real Claude API key
2. Go to `/scenarios/yogurt-ordering-system`
3. Type a short answer in the evaluator textarea
4. Submit — verify a JSON result renders with covered/missed/followUp sections

---

## Task 13: `CLAUDE.md`

**Files:**
- Create: `CLAUDE.md`

- [ ] **Step 1: Create `CLAUDE.md`**

```markdown
# System Design for Humans — Claude Code Guide

## Project Overview

A Next.js 14 system design learning platform. Content is organized into two directories:

- `app/fundamentals/{slug}/` — Fundamentals guides + evaluator prompts
- `app/scenarios/{slug}/` — Scenario briefs + evaluator prompts

The learning path (phases, sections, scenarios) is defined in `lib/journey.ts`.

## Skills

This repo includes Claude skills for generating content. They live in `./.claude/skills/`:

| Skill | File | Purpose |
|-------|------|---------|
| `system-fundamentals` | `./.claude/skills/system-fundamentals/SKILL.md` | Generate fundamentals guides + evaluator prompts |
| `system-scenario` | `./.claude/skills/system-scenario/SKILL.md` | Generate scenario briefs + evaluator prompts |

When asked to generate a fundamentals guide or scenario — read the relevant skill file first.

## Content Paths

- **Fundamentals output**: `./app/fundamentals/{slug}/`
  - `{slug}-fundamentals.md` — the guide
  - `prompt.md` — the evaluator system prompt
- **Scenarios output**: `./app/scenarios/{slug}/`
  - `brief.md` — the requirements spec
  - `prompt.md` — the evaluator system prompt
- **Curriculum reference**: `lib/journey.ts` (JOURNEY constant defines all phases/sections)
- **Full path doc**: `docs/00-complete-system-design-path.md`

## Key Libraries

- `lib/journey.ts` — Curriculum structure (phases, sections, scenario slugs)
- `lib/content.ts` — Loads scenarios from `app/scenarios/`
- `lib/fundamentals.ts` — Loads guides from `app/fundamentals/`
- `lib/apiKey.ts` — Claude API key management (localStorage)

## Dev

```bash
pnpm install
pnpm dev
```
```

---

## Task 14: `.claude/skills/system-fundamentals/SKILL.md`

**Files:**
- Create: `.claude/skills/system-fundamentals/SKILL.md`

- [ ] **Step 1: Create `.claude/skills/system-fundamentals/SKILL.md`**

```markdown
---
name: system-fundamentals
description: Generate fundamentals guides and evaluator prompts for system design topics
tags: [system-design, fundamentals, learning]
---

# System Design Fundamentals Guide Generator

Generate a fundamentals guide and evaluator system prompt for a system design topic.

## When to Use

Use when:
- Adding a new topic to the learning path
- Need to generate `{slug}-fundamentals.md` + `prompt.md` for a section

Example: `/system-fundamentals Data Modeling` or `/system-fundamentals Consistent Hashing`

## Instructions

### Step 1: Extract Topic Information

1. Read `./lib/journey.ts` — source of truth for the curriculum
2. Find the section matching the user's requested topic (case-insensitive match against `label`)
3. Extract:
   - Section `id`, `label`, `mentalModelHook`, `analogies`
   - Phase number (which phase this section belongs to)
4. Read `./docs/00-complete-system-design-path.md` for the full description of this step (mental model, what you learn, scenarios, why now)

### Step 2: Read the Reference Example

Read the canonical example before generating:
- `./app/fundamentals/data-modeling/data-modeling-fundamentals.md` — tone, depth, structure

Match this style exactly.

### Step 3: Generate the Fundamentals Guide

**Output file**: `./app/fundamentals/{slug}/{slug}-fundamentals.md`

**Structure** (required sections in order):

#### 1. Overview
2-3 sentences: what this topic is and why it matters. One sentence connecting to what the learner already knows.

#### 2. Core Concept & Mental Model
Open with the analogy from `mentalModelHook` and `analogies` in journey.ts. Expand it into a concrete real-world scenario. No jargon before the analogy is established.

#### 3. Building Blocks — Three levels
Each level:
- **Why this level matters** — one paragraph
- **How to think about it** — prose mental model, no implementation code
- **Walking through it** — manual step-by-step trace on a small concrete example
- **The one thing to get right** — key insight or gotcha
- **Mermaid diagram** — ER diagram, architecture diagram, or concept map (whichever fits)

#### 4. Key Patterns
2 patterns that appear in real interview scenarios. For each:
- When to use it
- How to think about it (prose)
- Mermaid diagram if helpful

#### 5. Decision Framework
- Mermaid concept map (relationships between ideas)
- Decision tree (mermaid flowchart) — when to use what
- Trade-off table

#### 6. Common Gotchas
3-5 mistakes with: what goes wrong, why it's tempting, how to fix it.

**Rules:**
- Prose-first — concepts before diagrams
- Mermaid diagrams only (no code blocks for implementation)
- Use the `erDiagram`, `graph TD`, or `flowchart` mermaid syntax as appropriate
- Keep the running analogy from Section 2 alive throughout
- No TypeScript/Python/SQL code blocks — diagrams only

### Step 4: Generate the Evaluator System Prompt

**Output file**: `./app/fundamentals/{slug}/prompt.md`

Write a system prompt for the AI evaluator that:
1. Defines scope: only concepts within this topic
2. Lists the rubric for each phase level (what a complete answer covers)
3. Specifies the scope boundary (what to redirect if user goes beyond)
4. Ends with: "Respond ONLY with valid JSON: { \"covered\": [...], \"missed\": [...], \"followUp\": \"...\" or null }"

Reference: `./app/fundamentals/data-modeling/prompt.md` as the canonical example.

### Step 5: Wire into journey.ts

1. Read `./lib/journey.ts`
2. Find the section matching the topic slug
3. If `fundamentalsSlug` is missing, add it
4. If `fundamentalsBlurb` is missing, add a one-sentence description
5. Confirm both fields are set

### Step 6: Validate

Run: `pnpm build`
Expected: builds without errors. The path page should now show a live guide card for this section.
```

---

## Task 15: `.claude/skills/system-scenario/SKILL.md`

**Files:**
- Create: `.claude/skills/system-scenario/SKILL.md`

- [ ] **Step 1: Create `.claude/skills/system-scenario/SKILL.md`**

```markdown
---
name: system-scenario
description: Generate scenario briefs and evaluator prompts for system design practice
tags: [system-design, scenarios, practice]
---

# System Design Scenario Generator

Generate a scenario brief and evaluator system prompt for a system design practice scenario.

## When to Use

Use when adding a new scenario to a section's `firstPass` or `reinforce` list.

Example: `/system-scenario "Design a URL Shortener" / "Caching Fundamentals" / firstPass`

## Input Format

`/system-scenario "{scenario name}" / "{section label}" / {firstPass|reinforce}`

The pass type (`firstPass` or `reinforce`) must be explicitly provided — do not infer it.

## Instructions

### Step 1: Extract Context

1. Read `./lib/journey.ts` to find the target section by label
2. Read `./docs/00-complete-system-design-path.md` to find this scenario's entry (if it exists) for context on what it exercises
3. Note the phase number — this calibrates the expected answer depth

### Step 2: Read the Reference Example

Read before generating:
- `./app/scenarios/yogurt-ordering-system/brief.md` — brief format
- `./app/scenarios/yogurt-ordering-system/prompt.md` — evaluator prompt format

### Step 3: Generate the Scenario Brief

**Output file**: `./app/scenarios/{slug}/brief.md`

Write the requirements spec as it would appear in a real interview handout:
- `## Overview` — 2-3 sentences describing the system and context
- `## Functional Requirements` — bullet list of what the system must do, with sub-bullets for constraints
- `## What you should design` — explicit list of what the answer should cover (schema? API? specific components?)

**Rules:**
- No solution hinting — describe the problem, not the answer
- Include realistic constraints (weight limits, one-per-order rules, status transitions)
- Scale hints are optional for Phase 1, expected for Phase 2+
- Keep it to what would fit on one printed page

### Step 4: Generate the Evaluator System Prompt

**Output file**: `./app/scenarios/{slug}/prompt.md`

Write a system prompt that:
1. Names the scenario and its phase
2. Defines scope: what topics are in scope for this scenario, what to redirect if user goes beyond
3. Lists the rubric: what a strong answer covers (as a checklist)
4. Ends with: "Respond ONLY with valid JSON: { \"covered\": [...], \"missed\": [...], \"followUp\": \"...\" or null }"

The rubric should reflect the `relatedFundamentalsSlugs` for this scenario — those are the concepts being tested.

### Step 5: Wire into journey.ts

1. Read `./lib/journey.ts`
2. Find the target section
3. Add the new scenario to `firstPass` or `reinforce` (per the input pass type):

```typescript
{
  slug: 'design-url-shortener',
  label: 'Design a URL Shortener',
  relatedFundamentalsSlugs: ['caching-fundamentals', 'scalability-fundamentals'],
}
```

4. Save `journey.ts`

### Step 6: Validate

Run: `pnpm build`
Expected: builds without errors. The path page should now show the new scenario link under the target section.
```

- [ ] **Final verification: full build**

```bash
pnpm build
```

Expected: successful build with no TypeScript or Next.js errors. All static pages generated including `/fundamentals/data-modeling` and `/scenarios/yogurt-ordering-system`.
```
