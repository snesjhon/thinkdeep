# Excalidraw + Evaluator Integration Design

**Date:** 2026-03-26
**Status:** Approved

## Overview

Add an Excalidraw canvas to the existing evaluator sidebar so users can draw system design diagrams and talk through them in the same chat thread. The page always stays in read mode — the canvas only lives inside the sidebar panel.

## User Flow

1. User reads content, hits **"Discuss it →"** in a "Check your understanding" block.
2. The `ChatSidebar` slides in (exactly as today).
3. Two buttons appear in the sidebar header: **✏️ Draw** and **✓ Wrap Up**.
4. User chats normally. At any point, clicks **Draw** — the panel expands to ~80vw, Excalidraw canvas appears on the left, chat stays on the right.
5. User draws, hits **Submit drawing →** at the bottom of the canvas.
6. Drawing is exported as a compressed PNG and appended as a vision message in the shared chat thread. Claude responds inline.
7. User continues chatting or drawing — canvas stays open until they click **Draw** again to close it.
8. Panel animates back to 420px. Chat continues uninterrupted.
9. **Wrap Up** button triggers the existing summary flow (strengths, gaps, one concept to look up) — same as today, now surfaced as a header button.

## Component Changes

### `ChatSidebar.tsx` — primary change

**New state:**
```typescript
const [drawOpen, setDrawOpen] = useState(false)
const excalidrawAPIRef = useRef<ExcalidrawImperativeAPI | null>(null)
```

**Panel width:** driven by `drawOpen`:
- `false` → `w-[420px]` (unchanged)
- `true` → `w-[80vw]` animated via Framer Motion (same spring physics as slide-in)

**Header:** replaces current close button with:
```
[title]  [✏️ Draw]  [✓ Wrap Up]  [×]
```
- **Draw** toggles `drawOpen`, highlights when active
- **Wrap Up** calls existing `handleWrapUp()`
- **×** calls `onClose()`

**Body when `drawOpen`:**
- Left: `<Excalidraw>` component, full height, with **Submit drawing →** pinned to bottom
- Right: existing chat message list + input (narrower, fixed width ~360px)

**Body when `!drawOpen`:**
- Unchanged — full-width chat as today

**No changes to:** `Evaluator.tsx`, `MarkdownRenderer.tsx`, page components, `lib/`, `packages/ui/`.

## Draw Submission Flow

```
User clicks "Submit drawing →"
  → exportToBlob({ maxWidthOrHeight: 800 }) → PNG blob
  → FileReader converts to base64 data URL
  → Append to messages:
      { role: 'user', content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/png', data: base64String } },
          { type: 'text', text: 'Here is my diagram.' }
        ]
      }
  → Stream to Claude via existing API (claude-sonnet-4-6 already vision-capable)
  → Response streams into chat
  → Canvas stays open, drawing unchanged
```

**Token cost:** `maxWidthOrHeight: 800` caps worst-case at ~850 tokens. Sparse diagrams export smaller naturally. Can be tuned to 600 (~600 tokens max) if needed.

## State & Persistence

| Key | Value | Cleared by |
|-----|-------|-----------|
| `chat:${slug}:${index}` | Chat messages (existing) | Reset button |
| `chat:${slug}:${index}:drawing` | Excalidraw scene JSON | Reset button |

Canvas JSON (`getSceneElements()`) is saved to localStorage on every change, debounced 500ms. On reopening the sidebar and toggling Draw, the canvas is restored. The JSON is **only** used for local persistence — never sent to Claude.

## Dependencies

- Add `@excalidraw/excalidraw` to `apps/system-design-for-humans/package.json`
- No other new dependencies

## Out of Scope

- Multiple saved drawings per session
- Sharing or exporting drawings outside the session
- Drawing on scenarios vs fundamentals — works the same on both (both use `Evaluator` → `ChatSidebar`)
