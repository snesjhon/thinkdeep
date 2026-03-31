# Conversational Evaluator — Design Spec

**Date:** 2026-03-24
**Status:** Approved

---

## Overview

Replace the current one-shot Evaluator (textarea → covered/missed/follow-up) with a multi-turn chat interface. The new experience is a Socratic tutor: it opens with the question, responds with hints and follow-ups, stays on topic, and closes with a structured summary.

---

## Component Architecture

### `Evaluator.tsx` (full replacement)

The existing component is replaced entirely. Same props interface:

```ts
interface EvaluatorProps {
  promptContent: string  // evaluator system prompt from prompt.md
  phase: number          // 1=Novice, 2=Studied, 3=Expert
  question?: string      // the opening question shown to the user
}
```

Internal state:

```ts
interface Message {
  role: 'assistant' | 'user'
  content: string
}

interface SummaryResult {
  strengths: string[]   // what the user got right
  reinforce: string[]   // what needs more work
  lookUp: string        // one thing to explore further
}

// Component state:
messages: Message[]           // full conversation history
displayBuffer: string         // accumulated streamed text for the current AI turn
input: string                 // current textarea value
streaming: boolean            // true while AI is generating a chat response
summarizing: boolean          // true while the summary API call is in flight
wrapUpSuggested: boolean      // true when AI has signalled it is ready to close
wrapUpDismissed: boolean      // true when user clicked "Keep going"
summary: SummaryResult | null // set when wrap-up completes
error: string | null          // last error message, shown below input bar
```

`streaming` and `summarizing` are separate because their UX differs: during `streaming` a new AI bubble streams in; during `summarizing` the input area is replaced by a spinner overlay.

---

## Layout

A scrollable chat container (`max-height: 480px`, overflows on smaller viewports to `100%`) replacing the current textarea + results block.

```
┌─────────────────────────────────────────────┐
│  CHECK YOUR UNDERSTANDING                   │
├─────────────────────────────────────────────┤
│                                             │
│  [AI bubble] Opening question...            │
│                                             │
│              [User bubble] Response...      │
│                                             │
│  [AI bubble] Hint / follow-up...            │
│                                        ↕    │  ← plain overflow-y: auto div, auto-scroll
│              [User bubble] ...              │
│                                             │
│  ┌──────────────────────────────────────┐   │  ← wrap-up banner (conditonal)
│  │ Ready to wrap up? [Yes] [Keep going] │   │
│  └──────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│  [textarea auto-expand]    [Send] [Wrap up] │  ← input bar
└─────────────────────────────────────────────┘
```

**Scroll container**: a plain `div` with `overflow-y: auto` and a `ref` used to call `scrollTop = scrollHeight` after each message update. No external scroll library needed — consistent with the rest of the codebase's inline-style approach.

**Input bar**: auto-expanding textarea + Send button (disabled while `streaming || summarizing`) + "Wrap up" button (also disabled while `streaming || summarizing` to prevent concurrent API calls). Both buttons share the same wrap-up trigger.

**Summary card**: replaces the entire chat container (messages + input bar) when `summary` is set.

---

## Message Bubble Styles

Using existing CSS design tokens — no new colors introduced.

| Sender | Background | Border | Text | Alignment |
|--------|-----------|--------|------|-----------|
| AI | `--bg-alt` | `--border` | `--fg` | Left |
| User | `--purple-tint` | `color-mix(in srgb, var(--purple) 25%, transparent)` | `--fg` | Right |

AI bubbles render via `react-markdown` (already installed) for light formatting support. User bubbles render as plain text.

---

## AI System Prompt (Chat Turns)

The `promptContent` from `prompt.md` is the base. The system prompt wraps it with a tutor persona:

```
You are a focused Socratic tutor for system design. Your job is to guide
the learner through the concepts in the evaluation criteria below — not
reveal answers, but ask targeted questions and offer hints.

Rules:
1. Stay strictly on the topic defined by the evaluation criteria. If the
   user ventures into a different concept, acknowledge it briefly and
   redirect: "That's worth exploring — let's finish this topic first."
2. Never dump a list of what was missed. Instead, pick the most important
   gap and ask a hint question about it.
3. When the learner has sufficiently covered the key concepts, end your
   message with the exact string [[WRAP_SUGGESTED]] on its own line.
   Do not include any text after [[WRAP_SUGGESTED]].
4. Phase level: {phase} (1=Novice, 2=Studied, 3=Expert). Calibrate depth.

Evaluation criteria:
{promptContent}
```

### Token stripping during streaming

Claude streams responses as chunks. `[[WRAP_SUGGESTED]]` may arrive split across chunk boundaries. The safe approach:

1. Accumulate each chunk into `displayBuffer` as it arrives.
2. After each append, check if `displayBuffer` contains the complete string `[[WRAP_SUGGESTED]]`.
3. When found: strip `[[WRAP_SUGGESTED]]` and any trailing whitespace/newlines from `displayBuffer`; set `wrapUpSuggested: true`.
4. Render `displayBuffer` (not the raw chunk) into the active AI bubble.

Per-chunk replacement is not safe — use the accumulated buffer check instead.

---

## Conversation Flow

### 1. Mount — opening message

On mount, the `question` prop is **pre-seeded as an assistant message** directly into the `messages` array without an API call:

```ts
messages: [{ role: 'assistant', content: question ?? 'What can you tell me about this topic?' }]
```

This avoids an unnecessary API round-trip and ensures the opening message appears instantly. The seeded message is included in all subsequent API calls as the first `assistant` turn.

### 2. User turn

User types and submits. The user message is appended to `messages`. An API streaming call is made with the full `messages` history (including the seeded opening). The response streams into a new assistant bubble via `displayBuffer`.

### 3. Redirect

If the user goes off-topic, the AI redirects inline — no special component state. The conversation continues normally.

### 4. Wrap-up signal

When `[[WRAP_SUGGESTED]]` is detected in `displayBuffer` (and `wrapUpDismissed` is `false`), a banner appears above the input bar:

> *"Looks like we've covered the main ideas — ready for a summary?"*
> **[Yes, wrap up]** **[Keep going]**

The banner remains visible on subsequent turns until the user acts on it. If the user submits another message without clicking either button, the banner persists. Clicking "Keep going" sets `wrapUpDismissed: true` and hides the banner permanently for this session.

### 5. User-initiated wrap-up

The "Wrap up" button in the input bar is always present and triggers the same summary flow as "Yes, wrap up."

### 6. Summary generation

A **non-streaming** API call is made with the full `messages` history. Non-streaming is used here because parsing streamed JSON is fragile.

System prompt for summary call:

```
You are evaluating a learner's understanding based on the conversation below.
Return ONLY a valid JSON object — no markdown, no code fences, no extra text.
Shape:
{
  "strengths": ["what the learner demonstrated well", ...],
  "reinforce": ["concepts that need more work", ...],
  "lookUp": "one specific thing the learner should read about next"
}
```

User message: `"Please summarize this conversation."`

JSON parsing: strip any leading/trailing markdown fences before `JSON.parse()`, identical to the approach in the existing `Evaluator.tsx`. On parse failure, set `error` and leave `summary` null so the user can retry.

### 7. Summary card

On successful parse, `summary` is set. The chat container and input bar are replaced by the summary card. A "Start over" button resets all state to initial values and re-seeds the opening `question` message, returning the component to step 1.

---

## Summary Card

Three sections using existing color conventions:

- **What you covered well** — `--green` label, bullet list (`strengths`)
- **Worth reinforcing** — `--orange` label, bullet list (`reinforce`)
- **One thing to look up** — `--blue` label, single line (`lookUp`)

A "Start over" button at the bottom resets all state fields to initial values — `messages`, `displayBuffer`, `input`, `streaming`, `summarizing`, `wrapUpSuggested` (→ `false`), `wrapUpDismissed` (→ `false`), `summary`, `error` — and re-seeds the opening message from the `question` prop.

---

## Error Handling

`error: string | null` is displayed below the input bar (or below the summary trigger buttons during summarizing). Covers: missing API key, network failures, JSON parse failure. Mirrors the existing `Evaluator.tsx` error pattern. On a new user submission, `error` is cleared.

---

## Dependencies

| Package | Status | Purpose |
|---------|--------|---------|
| `@anthropic-ai/sdk` | Already installed | Streaming + non-streaming API calls |
| `react-markdown` | Already installed | Render AI bubble content |
| `framer-motion` | Already installed | Optional: message entry animation |

No new packages required. The scroll container uses a plain `div` with `overflow-y: auto` — consistent with the inline-style approach used throughout the codebase.
