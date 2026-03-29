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
