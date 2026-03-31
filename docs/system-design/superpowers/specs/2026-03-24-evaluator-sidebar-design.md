# Evaluator Sidebar — Design Spec

**Date:** 2026-03-24
**Status:** Approved

---

## Overview

Refactor the inline conversational Evaluator into two parts: a minimal inline card that shows the question and a single "Discuss it" button, and a fixed right-side sidebar panel that contains the full Socratic chat. The sidebar slides in over the page content and can be closed at any time.

---

## Component Architecture

### `Evaluator.tsx` (simplified)

Becomes a thin inline card. Owns only `isOpen` state.

```ts
interface EvaluatorProps {
  promptContent: string  // unchanged
  phase: number          // unchanged
  question?: string      // unchanged
}
```

Renders:
1. "CHECK YOUR UNDERSTANDING" label (monospace, uppercase, `--fg-gutter`)
2. Question bubble (`--purple-tint` background, `--purple` border, same style as current)
3. "Discuss it" button (`--purple` background, white text) — sets `isOpen: true`
4. `<ChatSidebar>` (always mounted, `isOpen` prop controls visibility)

No chat state lives here.

---

### `components/ChatSidebar.tsx` (new file)

Contains all chat logic moved from the current `Evaluator.tsx`. Rendered via `createPortal(…, document.body)` so `position: fixed` anchors to the viewport regardless of ancestor CSS.

Must begin with `'use client'` — it uses `createPortal`, `useState`, and Framer Motion, all of which require a client boundary. Do not omit this directive.

```ts
interface ChatSidebarProps {
  isOpen: boolean
  onClose: () => void
  promptContent: string
  phase: number
  question?: string
}
```

Internal state (identical to current Evaluator state):
```ts
messages: Message[]
displayBuffer: string
input: string
streaming: boolean
summarizing: boolean
wrapUpSuggested: boolean
wrapUpDismissed: boolean
summary: SummaryResult | null
error: string | null
```

On close (`onClose` called or backdrop clicked): resets all state to initial values and re-seeds the opening message. This ensures a fresh conversation each time the sidebar opens.

---

## Layout

### Inline card

```
┌─────────────────────────────────────────────────────────┐
│  CHECK YOUR UNDERSTANDING                               │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Think of a university course registration       │   │
│  │ system. Identify at least 3 entities…           │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [Discuss it →]                                         │
└─────────────────────────────────────────────────────────┘
```

### Sidebar overlay

```
┌─────────────────────────────────┬──────────────────────┐
│                                 │  Discuss it       ✕  │
│   Page content (dimmed)         ├──────────────────────┤
│                                 │                      │
│                                 │  [AI bubble]         │
│                                 │                      │
│                                 │       [User bubble]  │
│                                 │                      │
│                                 │  [AI bubble]         │
│                                 ├──────────────────────┤
│                                 │  [wrap-up banner]    │
│                                 ├──────────────────────┤
│                                 │  [textarea] [Send]   │
│                                 │             [Wrap up]│
└─────────────────────────────────┴──────────────────────┘
```

---

## Sidebar Panel Styles

| Property | Value |
|----------|-------|
| Position | `fixed`, `right: 0`, `top: 0` |
| Size | `width: 420px`, `height: 100vh` |
| Background | `--bg` |
| Border | `1px solid var(--border)` on left edge |
| Box shadow | `−4px 0 24px color-mix(in srgb, var(--fg) 8%, transparent)` |
| z-index | `50` |
| Overflow | `hidden` (inner scroll area handles scrolling) |

**Backdrop:**
- `position: fixed`, `inset: 0`, `z-index: 49`
- `background: color-mix(in srgb, var(--fg) 20%, transparent)`
- Clicking backdrop calls `onClose`

**Animation (Framer Motion):**
- `initial={{ x: '100%' }}`, `animate={{ x: 0 }}`, `exit={{ x: '100%' }}`
- `transition={{ type: 'spring', stiffness: 300, damping: 30 }}`
- Wrap in `<AnimatePresence>` in `Evaluator.tsx` so exit animation plays on close

**Header:**
- Left: "Discuss it" label (monospace, uppercase, `--fg-gutter`)
- Right: X close button (`--fg-comment`, hover `--fg`)
- Bottom border: `1px solid var(--border)`
- Height: `~52px`

---

## Message List & Chat

Identical to current `Evaluator.tsx` chat implementation:
- Scroll container: `flex: 1`, `overflow-y: auto`, auto-scrolls to bottom
- AI bubbles: left-aligned, `--bg-alt` bg
- User bubbles: right-aligned, `--purple-tint` bg
- Streaming buffer bubble + "thinking…" indicator
- Wrap-up banner: `--blue-tint` bg, above input bar
- Input bar: auto-expanding textarea, Send + Wrap up buttons
- Summary card: replaces chat area, "↩ Start over" resets and closes sidebar
- Error display: rendered inside the sidebar panel above the input bar (not in the inline card)

---

## State Reset on Close

When `onClose` is called (X button, backdrop click, or "↩ Start over"):
- All state fields reset to initial values
- `messages` re-seeded with opening question
- `isOpen` set to `false` in `Evaluator`

"↩ Start over" on the summary card: resets chat state AND calls `onClose`, returning the user to the inline card.

---

## Portal Rendering

`ChatSidebar` uses `createPortal` to render both the backdrop and the panel into `document.body`. This prevents any ancestor `transform`, `overflow: hidden`, or `z-index` stacking context from clipping the fixed panel.

```ts
import { createPortal } from 'react-dom'
// Inside render:
return createPortal(<>…backdrop…panel…</>, document.body)
```

---

## Files Changed

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `components/Evaluator.tsx` | Simplified to inline card + isOpen state |
| Create | `components/ChatSidebar.tsx` | Chat panel with all conversation logic |

`lib/chat.ts` unchanged.

---

## Dependencies

All already installed: `framer-motion`, `react-dom` (createPortal), `@anthropic-ai/sdk`, `react-markdown`.
