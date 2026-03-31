# Excalidraw + Evaluator Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an Excalidraw canvas inside the evaluator chat sidebar so users can draw system design diagrams and submit them to Claude as part of a shared conversation thread.

**Architecture:** `ChatSidebar.tsx` gains a `drawOpen` boolean that expands the panel from 420px to 80vw (animated via Framer Motion). When expanded, an Excalidraw canvas renders on the left and the existing chat stays on the right. A "Submit drawing →" button exports the canvas as a base64 PNG and appends it to the shared `messages` array as a multimodal user message. The page always stays in read mode — the canvas only exists inside the sidebar.

**Tech Stack:** `@excalidraw/excalidraw` (React component + `exportToBlob`), Anthropic SDK vision (already installed), Framer Motion (already installed), Next.js dynamic imports (SSR safety), localStorage for canvas persistence.

---

## File Map

| File | Change |
|------|--------|
| `apps/system-design-for-humans/package.json` | Add `@excalidraw/excalidraw` dependency |
| `apps/system-design-for-humans/next.config.mjs` | Add `@excalidraw/excalidraw` to `transpilePackages` |
| `apps/system-design-for-humans/components/ChatSidebar.tsx` | All feature changes live here |

No other files change.

---

## Task 1: Install @excalidraw/excalidraw and configure Next.js

**Files:**
- Modify: `apps/system-design-for-humans/package.json`
- Modify: `apps/system-design-for-humans/next.config.mjs`

- [ ] **Step 1: Install the package**

Run from the monorepo root (where pnpm-workspace.yaml lives):
```bash
cd /path/to/for-humans
pnpm add @excalidraw/excalidraw --filter system-design-for-humans
```

Expected: `dependencies` in `apps/system-design-for-humans/package.json` gains `"@excalidraw/excalidraw": "..."`.

- [ ] **Step 2: Add to transpilePackages**

`@excalidraw/excalidraw` is ESM-only. Next.js 14 needs it in `transpilePackages` or it will throw on build.

Edit `apps/system-design-for-humans/next.config.mjs`:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@for-humans/tokens', '@for-humans/ui', '@excalidraw/excalidraw'],
}
export default nextConfig
```

- [ ] **Step 3: Verify dev server starts without errors**

```bash
cd apps/system-design-for-humans
pnpm dev
```

Expected: server starts on `http://localhost:3000`, no module resolution errors in the terminal. Open any fundamentals page and confirm it loads normally.

- [ ] **Step 4: Stage changes**

```bash
git add apps/system-design-for-humans/package.json apps/system-design-for-humans/next.config.mjs pnpm-lock.yaml
```

---

## Task 2: Extend Message type and update API message builder

**Files:**
- Modify: `apps/system-design-for-humans/components/ChatSidebar.tsx`

The current `Message` type uses `content: string`. To send drawings to Claude we need to support image content blocks in the Anthropic API call. We store `imageData` (raw base64 PNG) separately from `content` (display text) — this keeps the existing string-based rendering working and lets us strip image data before persisting to localStorage (base64 images are too large to persist).

- [ ] **Step 1: Extend the Message interface**

In `ChatSidebar.tsx`, find the `Message` interface (currently around line 48) and replace it:

```typescript
interface Message {
  role: 'assistant' | 'user'
  content: string
  imageData?: string  // base64 PNG for drawing submissions — not persisted to localStorage
}
```

- [ ] **Step 2: Update saveMessages to strip imageData**

Find `saveMessages` (currently around line 22) and replace it:

```typescript
function saveMessages(key: string, messages: Message[]) {
  try {
    // Strip imageData before persisting — base64 PNGs are too large for localStorage
    const stripped = messages.map(({ imageData: _img, ...m }) => m)
    const capped = stripped.length > MESSAGE_CAP ? stripped.slice(-MESSAGE_CAP) : stripped
    localStorage.setItem(key, JSON.stringify(capped))
  } catch {
    // localStorage full or unavailable — silently skip
  }
}
```

- [ ] **Step 3: Update handleSend to accept optional imageData and build multimodal API messages**

The current `handleSend` is hardcoded to send `input.trim()` as text. Replace it entirely:

```typescript
async function handleSend(imageData?: string) {
  const apiKey = getApiKey()
  if (!apiKey) {
    setError('No API key set. Add your Claude API key in Settings.')
    return
  }

  const textContent = imageData ? 'Here is my diagram.' : input.trim()
  if (!textContent || busy) return

  setError(null)
  const userMessage: Message = {
    role: 'user',
    content: textContent,
    ...(imageData && { imageData }),
  }
  const updatedMessages = [...messages, userMessage]
  setMessages(updatedMessages)
  if (!imageData) setInput('')
  setStreaming(true)
  setDisplayBuffer('')

  try {
    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })

    const apiMessages = updatedMessages.map(m => {
      if (m.imageData) {
        return {
          role: 'user' as const,
          content: [
            {
              type: 'image' as const,
              source: {
                type: 'base64' as const,
                media_type: 'image/png' as const,
                data: m.imageData,
              },
            },
            { type: 'text' as const, text: m.content },
          ],
        }
      }
      return {
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }
    })

    let accumulated = ''

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: buildSystemPrompt(promptContent, phase),
      messages: apiMessages,
    })

    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta'
      ) {
        accumulated += chunk.delta.text
        const { display, wrapDetected } = stripWrapToken(accumulated)
        setDisplayBuffer(display)
        if (wrapDetected) setWrapUpSuggested(true)
      }
    }

    const { display } = stripWrapToken(accumulated)
    const assistantMessage: Message = { role: 'assistant', content: display }
    setMessages(prev => [...prev, assistantMessage])
    setDisplayBuffer('')
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    setError(`Error: ${msg}`)
  } finally {
    setStreaming(false)
  }
}
```

- [ ] **Step 4: Update message rendering to show image thumbnail**

Find the message list render (the `messages.map` around line 391). The user bubble currently renders `msg.content` as plain text. Add image thumbnail above the text for drawing messages:

```tsx
{messages.map((msg, i) => (
  <div key={i} style={msg.role === 'assistant' ? aiBubbleStyle : userBubbleStyle}>
    {msg.role === 'assistant' ? (
      <ReactMarkdown>{msg.content}</ReactMarkdown>
    ) : (
      <>
        {msg.imageData && (
          <img
            src={`data:image/png;base64,${msg.imageData}`}
            alt="Submitted diagram"
            style={{ maxWidth: '100%', borderRadius: 6, marginBottom: 6, display: 'block' }}
          />
        )}
        {msg.content}
      </>
    )}
  </div>
))}
```

- [ ] **Step 5: Verify chat still works**

With dev server running, open a fundamentals page, click "Discuss it →", type a message and send it. Confirm the chat still works normally (no regressions).

- [ ] **Step 6: Stage**

```bash
git add apps/system-design-for-humans/components/ChatSidebar.tsx
```

---

## Task 3: Refactor the sidebar header — Draw and Wrap Up buttons

**Files:**
- Modify: `apps/system-design-for-humans/components/ChatSidebar.tsx`

The current header has only a title and a `✕` close button. The "Wrap up" button lives in the input bar. We're moving Wrap Up to the header and adding a Draw toggle button. The input bar's "Wrap up" button is removed — the header button replaces it.

- [ ] **Step 1: Add drawOpen state**

At the top of the `ChatSidebar` component, after the existing state declarations, add:

```typescript
const [drawOpen, setDrawOpen] = useState(false)
```

- [ ] **Step 2: Replace the header**

Find the header `<div>` (currently around line 307, the `flex items-center justify-between` div). Replace it entirely:

```tsx
{/* Header */}
<div className="flex items-center gap-2 px-4 h-[52px] border-b border-b-[var(--border)] shrink-0">
  <p className="font-[ui-monospace,monospace] text-[0.65rem] font-bold tracking-[0.1em] uppercase text-[var(--fg-gutter)] m-0 flex-1">
    Discuss it
  </p>
  <button
    onClick={() => setDrawOpen(prev => !prev)}
    className="flex items-center gap-1 px-3 py-[5px] rounded-[5px] border text-[0.75rem] font-medium transition-colors"
    style={{
      background: drawOpen ? 'var(--fg)' : 'var(--bg-alt)',
      color: drawOpen ? 'var(--bg)' : 'var(--fg-alt)',
      borderColor: drawOpen ? 'var(--fg)' : 'var(--border)',
      cursor: 'pointer',
    }}
  >
    ✏️ {drawOpen ? 'Drawing…' : 'Draw'}
  </button>
  <button
    onClick={handleWrapUp}
    disabled={busy}
    className="flex items-center gap-1 px-3 py-[5px] rounded-[5px] border text-[0.75rem] font-medium"
    style={{
      background: 'var(--bg-alt)',
      color: busy ? 'var(--fg-gutter)' : 'var(--fg-alt)',
      borderColor: 'var(--border)',
      cursor: busy ? 'not-allowed' : 'pointer',
    }}
  >
    ✓ Wrap Up
  </button>
  <button
    onClick={handleClose}
    className="bg-transparent border-0 cursor-pointer text-[var(--fg-comment)] text-[1.25rem] leading-none p-[4px] rounded-[4px] flex items-center justify-center ml-1"
    aria-label="Close"
  >
    ✕
  </button>
</div>
```

- [ ] **Step 3: Remove the "Wrap up" button from the input bar**

Find the input bar's two-button column (around line 489, the `<div className="flex flex-col gap-[0.375rem]">`). The column currently has Send + Wrap up. Remove the Wrap up button, leaving only Send:

```tsx
<div className="flex flex-col gap-[0.375rem]">
  <button
    onClick={() => handleSend()}
    disabled={busy || !input.trim()}
    className="px-4 py-[7px] rounded-[6px] border-0 text-[0.8125rem] font-semibold whitespace-nowrap"
    style={{
      background: busy || !input.trim() ? 'var(--bg-highlight)' : 'var(--purple)',
      color: busy || !input.trim() ? 'var(--fg-gutter)' : 'white',
      cursor: busy || !input.trim() ? 'not-allowed' : 'pointer',
    }}
  >
    {streaming ? 'Sending…' : 'Send'}
  </button>
</div>
```

Note `onClick={() => handleSend()}` — this calls `handleSend` with no arguments (text mode), matching the updated signature from Task 2.

- [ ] **Step 4: Also update the Enter key handler**

Find the `onKeyDown` on the textarea (around line 471). Update it to match the new signature:

```tsx
onKeyDown={e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}}
```

- [ ] **Step 5: Verify header renders correctly**

Open a "Discuss it →" sidebar. Confirm: title on left, Draw + Wrap Up + ✕ buttons on right. Clicking Wrap Up should trigger the summary flow. Draw button should toggle visually (no canvas yet — that's Task 4).

- [ ] **Step 6: Stage**

```bash
git add apps/system-design-for-humans/components/ChatSidebar.tsx
```

---

## Task 4: Add animated panel width + Excalidraw canvas panel

**Files:**
- Modify: `apps/system-design-for-humans/components/ChatSidebar.tsx`

When `drawOpen` is true, the panel expands from 420px to 80vw. The Excalidraw canvas renders on the left, the existing chat content stays on the right in a fixed 380px column.

- [ ] **Step 1: Add dynamic Excalidraw import at the top of the file**

After the existing imports in `ChatSidebar.tsx`, add:

```typescript
import dynamic from 'next/dynamic'

const ExcalidrawDynamic = dynamic(
  () => import('@excalidraw/excalidraw').then(m => ({ default: m.Excalidraw })),
  {
    ssr: false,
    loading: () => (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-comment)', fontSize: '0.875rem', fontStyle: 'italic' }}>
        Loading canvas…
      </div>
    ),
  }
)
```

- [ ] **Step 2: Add refs and drawing storage key**

In the component body, after the `drawOpen` state, add:

```typescript
const excalidrawAPIRef = useRef<{ getSceneElements: () => readonly unknown[]; getFiles: () => Record<string, unknown> } | null>(null)
const drawSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
const drawingStorageKey = storageKey ? `${storageKey}:drawing` : null
```

- [ ] **Step 3: Load initial canvas elements from localStorage**

Add this state right after `drawingStorageKey`:

```typescript
const [initialDrawingElements] = useState<unknown[]>(() => {
  if (!drawingStorageKey) return []
  try {
    const raw = localStorage.getItem(drawingStorageKey)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
})
```

- [ ] **Step 4: Add canvas save handler**

Add this function inside the component (after `handleReset`):

```typescript
function handleCanvasChange(elements: readonly unknown[]) {
  if (!drawingStorageKey) return
  if (drawSaveTimerRef.current) clearTimeout(drawSaveTimerRef.current)
  drawSaveTimerRef.current = setTimeout(() => {
    try {
      localStorage.setItem(drawingStorageKey, JSON.stringify(elements))
    } catch {
      // localStorage full — silently skip
    }
  }, 500)
}
```

- [ ] **Step 5: Update handleReset to also clear drawing**

In `handleReset`, after `if (storageKey) clearMessages(storageKey)`, add:

```typescript
if (drawingStorageKey) {
  try { localStorage.removeItem(drawingStorageKey) } catch { /* ignore */ }
}
```

Also reset drawOpen:
```typescript
setDrawOpen(false)
```

- [ ] **Step 6: Update the panel motion.div to animate width**

Find the panel `<motion.div>` (currently around line 295 with `className="fixed right-0 top-0 w-[420px] ..."`) and update it to animate width based on `drawOpen`:

```tsx
<motion.div
  key="panel"
  initial={{ x: '100%' }}
  animate={{ x: 0, width: drawOpen ? '80vw' : '420px' }}
  exit={{ x: '100%' }}
  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
  className="fixed right-0 top-0 h-screen z-50 bg-[var(--bg)] border-l border-l-[var(--border)] flex flex-col overflow-hidden"
  style={{
    boxShadow: '-4px 0 24px color-mix(in srgb, var(--fg) 8%, transparent)',
  }}
>
```

Note: `w-[420px]` is removed from className — width is now controlled by the `animate` prop.

- [ ] **Step 7: Wrap the content area to support canvas + chat side-by-side**

Find the content area `<div className="flex-1 flex flex-col overflow-hidden relative">` (around line 321). Replace it with:

```tsx
{/* Content area — two-column when drawOpen, single-column otherwise */}
<div className="flex-1 flex overflow-hidden relative" style={{ minHeight: 0 }}>
  {/* Canvas panel — only rendered when drawOpen */}
  {drawOpen && (
    <div className="flex flex-col border-r border-r-[var(--border)]" style={{ flex: 1, minWidth: 0 }}>
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <ExcalidrawDynamic
          excalidrawAPI={api => { excalidrawAPIRef.current = api as typeof excalidrawAPIRef.current }}
          initialData={{ elements: initialDrawingElements as Parameters<typeof ExcalidrawDynamic>[0] extends { initialData?: { elements?: infer E } } ? E : never[] }}
          onChange={elements => handleCanvasChange(elements)}
          UIOptions={{ canvasActions: { export: false, loadScene: false, saveToActiveFile: false, saveAsImage: false } }}
        />
      </div>
      {/* Submit button pinned to bottom of canvas */}
      <div className="border-t border-t-[var(--border)] p-3 bg-[var(--bg-alt)] shrink-0 flex justify-end">
        <button
          onClick={handleSubmitDrawing}
          disabled={busy}
          className="px-4 py-[7px] rounded-[6px] border-0 text-[0.8125rem] font-semibold"
          style={{
            background: busy ? 'var(--bg-highlight)' : 'var(--purple)',
            color: busy ? 'var(--fg-gutter)' : 'white',
            cursor: busy ? 'not-allowed' : 'pointer',
          }}
        >
          {streaming ? 'Submitting…' : 'Submit drawing →'}
        </button>
      </div>
    </div>
  )}

  {/* Chat column — always visible, fixed width when drawing open */}
  <div
    className="flex flex-col overflow-hidden"
    style={{ width: drawOpen ? '380px' : '100%', flexShrink: 0 }}
  >
    {summarizing && (
      <div
        className="absolute inset-0 flex items-center justify-center z-10"
        style={{ background: 'color-mix(in srgb, var(--bg) 85%, transparent)' }}
      >
        <p className="text-[var(--fg-comment)] text-sm italic">Generating summary…</p>
      </div>
    )}

    {summary ? (
      /* ---- Summary view ---- */
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
        {summary.strengths.length > 0 && (
          <div>
            <p className="font-[ui-monospace,monospace] text-[0.65rem] font-bold tracking-[0.09em] uppercase text-[var(--green)] mb-2">
              What you covered well
            </p>
            <ul className="m-0 pl-5">
              {summary.strengths.map((s, i) => (
                <li key={i} className="text-sm text-[var(--fg)] mb-1">{s}</li>
              ))}
            </ul>
          </div>
        )}
        {summary.reinforce.length > 0 && (
          <div>
            <p className="font-[ui-monospace,monospace] text-[0.65rem] font-bold tracking-[0.09em] uppercase text-[var(--orange)] mb-2">
              Worth reinforcing
            </p>
            <ul className="m-0 pl-5">
              {summary.reinforce.map((r, i) => (
                <li key={i} className="text-sm text-[var(--fg)] mb-1">{r}</li>
              ))}
            </ul>
          </div>
        )}
        {summary.lookUp && (
          <div
            className="px-[14px] py-[10px] rounded-[6px] bg-[var(--blue-tint)]"
            style={{ border: '1px solid color-mix(in srgb, var(--blue) 20%, transparent)' }}
          >
            <p className="font-[ui-monospace,monospace] text-[0.65rem] font-bold tracking-[0.09em] uppercase text-[var(--blue)] mb-[0.375rem]">
              One thing to look up
            </p>
            <p className="text-[0.9375rem] text-[var(--fg)] m-0">{summary.lookUp}</p>
          </div>
        )}
        <button
          onClick={handleReset}
          className="self-start px-4 py-[7px] rounded-[6px] border border-[var(--border)] bg-[var(--bg-alt)] text-[var(--fg-alt)] text-[0.8125rem] cursor-pointer"
        >
          ↩ Start over
        </button>
      </div>
    ) : (
      <>
        {/* ---- Message list ---- */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {messages.map((msg, i) => (
            <div key={i} style={msg.role === 'assistant' ? aiBubbleStyle : userBubbleStyle}>
              {msg.role === 'assistant' ? (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              ) : (
                <>
                  {msg.imageData && (
                    <img
                      src={`data:image/png;base64,${msg.imageData}`}
                      alt="Submitted diagram"
                      style={{ maxWidth: '100%', borderRadius: 6, marginBottom: 6, display: 'block' }}
                    />
                  )}
                  {msg.content}
                </>
              )}
            </div>
          ))}
          {streaming && displayBuffer && (
            <div style={aiBubbleStyle}><ReactMarkdown>{displayBuffer}</ReactMarkdown></div>
          )}
          {streaming && !displayBuffer && (
            <div className="text-[var(--fg-gutter)] italic" style={aiBubbleStyle}>thinking…</div>
          )}
        </div>

        {/* ---- Error display ---- */}
        {error && (
          <div className="px-3 py-2 border-t border-t-[var(--border)] flex items-center gap-3 flex-wrap bg-[var(--bg-alt)]">
            <p className="m-0 text-[0.8125rem]" style={{ color: 'var(--red, #e06c75)' }}>
              {error}{' '}
              {error.includes('API key') && (
                <a href="/settings" className="text-[var(--purple)]">Go to Settings →</a>
              )}
            </p>
            {error.includes('Summary failed') && (
              <button
                onClick={handleWrapUp}
                disabled={busy}
                className="px-3 py-[4px] rounded-[5px] border border-[var(--border)] bg-[var(--bg)] text-[var(--fg-alt)] text-[0.8125rem]"
                style={{ cursor: busy ? 'not-allowed' : 'pointer' }}
              >
                Retry summary
              </button>
            )}
          </div>
        )}

        {/* ---- Wrap-up banner ---- */}
        {wrapUpSuggested && !wrapUpDismissed && (
          <div className="border-t border-t-[var(--border)] px-3 py-[0.625rem] bg-[var(--blue-tint)] flex items-center justify-between gap-3 shrink-0">
            <p className="m-0 text-[0.8125rem] text-[var(--fg-alt)]">
              Looks like we&apos;ve covered the main ideas — ready for a summary?
            </p>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleWrapUp}
                disabled={busy}
                className="px-3 py-[5px] rounded-[5px] border-0 bg-[var(--blue)] text-white text-[0.8125rem] font-semibold"
                style={{ cursor: busy ? 'not-allowed' : 'pointer' }}
              >
                Yes, wrap up
              </button>
              <button
                onClick={() => setWrapUpDismissed(true)}
                className="px-3 py-[5px] rounded-[5px] border border-[var(--border)] bg-[var(--bg)] text-[var(--fg-alt)] text-[0.8125rem] cursor-pointer"
              >
                Keep going
              </button>
            </div>
          </div>
        )}

        {/* ---- Input bar ---- */}
        <div className="border-t border-t-[var(--border)] p-3 flex gap-2 items-end bg-[var(--bg-alt)] shrink-0">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Type your response… (Enter to send, Shift+Enter for newline)"
            rows={1}
            onInput={e => {
              e.currentTarget.style.height = 'auto'
              e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px'
            }}
            disabled={busy}
            className="flex-1 text-sm px-[10px] py-[8px] rounded-[6px] border border-[var(--border)] text-[var(--fg)] resize-none outline-none overflow-hidden min-h-[38px] max-h-[120px]"
            style={{ fontFamily: 'inherit', background: busy ? 'var(--bg-highlight)' : 'var(--bg)' }}
          />
          <button
            onClick={() => handleSend()}
            disabled={busy || !input.trim()}
            className="px-4 py-[7px] rounded-[6px] border-0 text-[0.8125rem] font-semibold whitespace-nowrap"
            style={{
              background: busy || !input.trim() ? 'var(--bg-highlight)' : 'var(--purple)',
              color: busy || !input.trim() ? 'var(--fg-gutter)' : 'white',
              cursor: busy || !input.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            {streaming ? 'Sending…' : 'Send'}
          </button>
        </div>
      </>
    )}
  </div>
</div>

- [ ] **Step 8: Add a placeholder handleSubmitDrawing (to prevent TS error)**

Add this stub after `handleCanvasChange` — it will be fully implemented in Task 5:

```typescript
async function handleSubmitDrawing() {
  // implemented in next step
}
```

- [ ] **Step 9: Fix Excalidraw initialData type**

The `initialData` prop type may cause a TypeScript complaint because `initialDrawingElements` is `unknown[]`. Simplify the canvas JSX to use a type assertion:

```tsx
<ExcalidrawDynamic
  excalidrawAPI={(api: unknown) => { excalidrawAPIRef.current = api as typeof excalidrawAPIRef.current }}
  initialData={{ elements: initialDrawingElements as never[] }}
  onChange={(elements: readonly unknown[]) => handleCanvasChange(elements)}
  UIOptions={{ canvasActions: { export: false, loadScene: false, saveToActiveFile: false, saveAsImage: false } }}
/>
```

- [ ] **Step 10: Verify canvas renders**

Run dev server. Open "Discuss it →", click **Draw**. Confirm:
- Panel animates to ~80vw
- Excalidraw canvas loads on the left
- Existing chat stays on the right in a 380px column
- "Submit drawing →" button is pinned at the bottom of the canvas
- Clicking **Draw** again collapses the panel back to 420px

- [ ] **Step 11: Stage**

```bash
git add apps/system-design-for-humans/components/ChatSidebar.tsx
```

---

## Task 5: Implement handleSubmitDrawing

**Files:**
- Modify: `apps/system-design-for-humans/components/ChatSidebar.tsx`

Replace the stub from Task 4 with the real implementation: export canvas as PNG, convert to base64, call `handleSend` with the image data.

- [ ] **Step 1: Replace the handleSubmitDrawing stub**

```typescript
async function handleSubmitDrawing() {
  if (busy || !excalidrawAPIRef.current) return

  const sceneElements = excalidrawAPIRef.current.getSceneElements()
  if (!sceneElements || (sceneElements as unknown[]).length === 0) return

  try {
    const { exportToBlob } = await import('@excalidraw/excalidraw')
    const blob = await exportToBlob({
      elements: sceneElements as never,
      appState: { exportBackground: true } as never,
      files: excalidrawAPIRef.current.getFiles() as never,
      maxWidthOrHeight: 800,
    })

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      // dataUrl is "data:image/png;base64,<data>" — strip the prefix
      const base64 = dataUrl.split(',')[1]
      handleSend(base64)
    }
    reader.readAsDataURL(blob)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    setError(`Failed to export drawing: ${msg}`)
  }
}
```

- [ ] **Step 2: End-to-end test**

With dev server running:
1. Open any fundamentals page → click "Discuss it →"
2. Send a text message ("Tell me about replication")
3. Click **Draw**, draw some boxes and arrows on the canvas
4. Click **Submit drawing →**
5. Confirm: a user bubble appears in the chat with an image thumbnail + "Here is my diagram.", Claude streams a response referencing the diagram
6. Click **Draw** again to close canvas, continue chatting
7. Click **Wrap Up** — confirm summary generates correctly
8. Reload the page, open the sidebar, click **Draw** — confirm canvas is restored from localStorage
9. Click "Start over" — confirm chat clears and canvas clears

- [ ] **Step 3: Stage all changes**

```bash
git add apps/system-design-for-humans/components/ChatSidebar.tsx
```
