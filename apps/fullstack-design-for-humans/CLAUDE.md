# Fullstack for Humans — Claude Code Guide

## Project Overview

A Next.js 14 learning platform for building a Rails chess app. Content is organized into two directories:

- `app/fundamentals/{slug}/` — Foundations guides + evaluator prompts (teach concepts and commands)
- `app/scenarios/{slug}/` — Scenario briefs + walkthroughs + evaluator prompts (build tasks)

The learning path (phases, sections, scenarios) is defined in `lib/journey.ts`.

## Skills

Skills for generating content live in `./.claude/skills/`:

| Skill | File | Purpose |
|-------|------|---------|
| `fullstack-fundamentals` | `./.claude/skills/fullstack-fundamentals/SKILL.md` | Generate foundations guides that teach Rails commands and concepts |
| `fullstack-scenario` | `./.claude/skills/fullstack-scenario/SKILL.md` | Generate scenario files for chess app build tasks |

When asked to generate a foundations guide or scenario — read the relevant skill file first.

## Content Paths

- **Foundations output**: `./app/fundamentals/{slug}/`
  - `{slug}-fundamentals.md` — the concept guide
  - `prompt.md` — Socratic tutor prompt (one `## Level N:` section per building-block level)
- **Scenarios output**: `./app/scenarios/{slug}/`
  - `brief.md` — the build task spec
  - `walkthrough.md` — the teaching guide (analogies, steps, evaluator blocks)
  - `prompt.md` — the CheckWork evaluator prompt (has `files:` YAML frontmatter)
- **Curriculum reference**: `lib/journey.ts` (3 phases: Novice / Studied / Expert)

## Key Differences from system-design-for-humans

- **Foundations** teach Rails commands and concepts (not system design theory)
- **Scenarios** are build tasks — the learner writes real Rails code
- **`prompt.md`** for scenarios has `files:` YAML frontmatter listing which chess app files to read for evaluation
- The `CheckWork` component reads those files from the learner's local chess app directory and sends them to Claude

## Key Libraries

- `lib/journey.ts` — Curriculum structure (3 phases: Novice / Studied / Expert)
- `lib/content.ts` — Loads scenarios from `app/scenarios/`
- `lib/checkWork.ts` — Parses `files:` frontmatter, reads chess app files
- `lib/projectPath.ts` — Stores/retrieves the chess app directory path (localStorage)
- `lib/apiKey.ts` — Claude API key management (localStorage)

## Dev

```bash
pnpm install
pnpm dev   # runs on port 3001
pnpm test  # jest unit tests
pnpm build # production build
```
