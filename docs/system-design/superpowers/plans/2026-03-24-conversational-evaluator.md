# Conversational Evaluator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the one-shot Evaluator with a multi-turn Socratic chat interface that opens with the question, guides via hints, stays on topic, and closes with a structured summary.

**Architecture:** A single `Evaluator.tsx` replacement plus a small `lib/chat.ts` utility for the `[[WRAP_SUGGESTED]]` token-stripping logic. The chat uses Anthropic streaming for turn responses and a non-streaming call for the final summary. No new packages required — the project already has `@anthropic-ai/sdk`, `react-markdown`, Tailwind, and the full CSS design token system.

**Tech Stack:** Next.js 14, React 18, `@anthropic-ai/sdk` (streaming), `react-markdown`, inline styles with CSS custom properties (`--bg-alt`, `--purple-tint`, `--border`, `--fg`, `--green`, `--orange`, `--blue`, `--purple`, `--fg-comment`, `--fg-gutter`)

**No automated test framework exists in this project.** Each task's verification step uses `pnpm dev` and manual browser interaction. The token-stripping logic is extracted to a pure function so it can be reasoned about in isolation.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `lib/chat.ts` | `stripWrapToken(buffer)` pure function — accumulate-and-strip logic for `[[WRAP_SUGGESTED]]` |
| Modify | `components/Evaluator.tsx` | Full replacement — state, chat UI, streaming, wrap-up, summary |

No other files change. `Evaluator` props stay identical so both `app/fundamentals/[slug]/page.tsx` and `app/scenarios/[slug]/page.tsx` require zero updates.

---

## Task 1: Extract token-stripping utility

**Files:**
- Create: `lib/chat.ts`

This is a pure function. No React. Reason about it first before touching any UI.

- [ ] **Step 1: Create `lib/chat.ts` with `stripWrapToken`**

```ts
// lib/chat.ts

export const WRAP_TOKEN = '[[WRAP_SUGGESTED]]'

/**
 * Given an accumulated streaming buffer, checks if it contains the wrap token.
 * Returns the display text (token stripped) and whether the token was found.
 *
 * Safe to call on every chunk — only strips when the full token is present.
 */
export function stripWrapToken(buffer: string): {
  display: string
  wrapDetected: boolean
} {
  const idx = buffer.indexOf(WRAP_TOKEN)
  if (idx === -1) return { display: buffer, wrapDetected: false }
  const display = buffer.slice(0, idx).trimEnd()
  return { display, wrapDetected: true }
}
```

- [ ] **Step 2: Verify the function manually in your head**

Mentally trace these cases:
- `"Great job!"` → `{ display: "Great job!", wrapDetected: false }`
- `"Nice work!\n[[WRAP_SUGGESTED]]"` → `{ display: "Nice work!", wrapDetected: true }`
- `"Partial [[WRAP_SU"` → `{ display: "Partial [[WRAP_SU", wrapDetected: false }` ← token not yet complete, safe

- [ ] **Step 3: Commit**

```bash
git add lib/chat.ts
git commit -m "feat: add stripWrapToken utility for chat evaluator"
```

---

## Task 2: Set up state and types in Evaluator.tsx

**Files:**
- Modify: `components/Evaluator.tsx`

Replace the file contents in one pass. Start with state and types — no JSX yet (just return `null` temporarily). This verifies TypeScript compiles before the UI exists.

- [ ] **Step 1: Replace Evaluator.tsx with state skeleton**

```tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { getApiKey } from '@/lib/apiKey'
import Anthropic from '@anthropic-ai/sdk'
import { stripWrapToken } from '@/lib/chat'

interface EvaluatorProps {
  promptContent: string
  phase: number
  question?: string
}

interface Message {
  role: 'assistant' | 'user'
  content: string
}

interface SummaryResult {
  strengths: string[]
  reinforce: string[]
  lookUp: string
}

const INITIAL_QUESTION = 'What can you tell me about this topic?'

function buildSystemPrompt(promptContent: string, phase: number): string {
  return `You are a focused Socratic tutor for system design. Your job is to guide
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
4. Phase level: ${phase} (1=Novice, 2=Studied, 3=Expert). Calibrate depth.

Evaluation criteria:
${promptContent}`
}

export default function Evaluator({ promptContent, phase, question }: EvaluatorProps) {
  const openingMessage = question ?? INITIAL_QUESTION

  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: openingMessage },
  ])
  const [displayBuffer, setDisplayBuffer] = useState('')
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [summarizing, setSummarizing] = useState(false)
  const [wrapUpSuggested, setWrapUpSuggested] = useState(false)
  const [wrapUpDismissed, setWrapUpDismissed] = useState(false)
  const [summary, setSummary] = useState<SummaryResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages or streaming buffer changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, displayBuffer])

  const busy = streaming || summarizing

  function handleReset() {
    setMessages([{ role: 'assistant', content: openingMessage }])
    setDisplayBuffer('')
    setInput('')
    setStreaming(false)
    setSummarizing(false)
    setWrapUpSuggested(false)
    setWrapUpDismissed(false)
    setSummary(null)
    setError(null)
  }

  // Placeholder return — fill in next task
  return null
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm build 2>&1 | head -40
```

Expected: no TypeScript errors. (Warnings about `ReactMarkdown` unused import are fine — it gets used in Task 3.)

- [ ] **Step 3: Commit**

```bash
git add components/Evaluator.tsx
git commit -m "feat: set up Evaluator state and types for conversational chat"
```

---

## Task 3: Build the chat message list UI

**Files:**
- Modify: `components/Evaluator.tsx`

Replace `return null` with the scroll container and message bubbles. No interaction yet — just rendering.

- [ ] **Step 1: Replace `return null` with the chat container and message list**

Replace the `return null` line with:

```tsx
  // --- Styles (reused across bubbles) ---
  const aiBubbleStyle: React.CSSProperties = {
    maxWidth: '80%',
    alignSelf: 'flex-start',
    padding: '10px 14px',
    borderRadius: '12px 12px 12px 3px',
    background: 'var(--bg-alt)',
    border: '1px solid var(--border)',
    fontSize: '0.9375rem',
    color: 'var(--fg)',
    lineHeight: 1.6,
  }

  const userBubbleStyle: React.CSSProperties = {
    maxWidth: '80%',
    alignSelf: 'flex-end',
    padding: '10px 14px',
    borderRadius: '12px 12px 3px 12px',
    background: 'var(--purple-tint)',
    border: '1px solid color-mix(in srgb, var(--purple) 25%, transparent)',
    fontSize: '0.9375rem',
    color: 'var(--fg)',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
  }

  return (
    <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
      <p style={{
        fontFamily: 'ui-monospace, monospace', fontSize: '0.65rem', fontWeight: 700,
        letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-gutter)', marginBottom: '1rem',
      }}>
        Check your understanding
      </p>

      {summary ? (
        /* Summary card — implemented in Task 6 */
        <div>Summary coming soon</div>
      ) : (
        <div style={{
          border: '1px solid var(--border)',
          borderRadius: '0.75rem',
          overflow: 'hidden',
          background: 'var(--bg)',
        }}>
          {/* Message list */}
          <div
            ref={scrollRef}
            style={{
              maxHeight: '480px',
              overflowY: 'auto',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            {messages.map((msg, i) => (
              <div key={i} style={msg.role === 'assistant' ? aiBubbleStyle : userBubbleStyle}>
                {msg.role === 'assistant' ? (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
            ))}

            {/* Active streaming bubble */}
            {streaming && displayBuffer && (
              <div style={aiBubbleStyle}>
                <ReactMarkdown>{displayBuffer}</ReactMarkdown>
              </div>
            )}

            {/* Typing indicator when streaming starts but no content yet */}
            {streaming && !displayBuffer && (
              <div style={{ ...aiBubbleStyle, color: 'var(--fg-gutter)', fontStyle: 'italic' }}>
                thinking…
              </div>
            )}
          </div>

          {/* Input area — implemented in Task 4 */}
          <div style={{ borderTop: '1px solid var(--border)', padding: '0.75rem' }}>
            <p style={{ color: 'var(--fg-comment)', fontSize: '0.875rem' }}>Input coming soon</p>
          </div>
        </div>
      )}

      {error && (
        <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--red, #e06c75)' }}>
          {error}{' '}
          {error.includes('API key') && (
            <a href="/settings" style={{ color: 'var(--purple)' }}>Go to Settings →</a>
          )}
        </p>
      )}
    </div>
  )
```

- [ ] **Step 2: Verify in browser**

```bash
pnpm dev
```

Navigate to any fundamentals page (e.g. `/fundamentals/data-modeling`). You should see:
- "CHECK YOUR UNDERSTANDING" label
- A bordered chat container
- The opening question rendered as an AI bubble (left-aligned, grey background)
- "Input coming soon" placeholder at the bottom

- [ ] **Step 3: Commit**

```bash
git add components/Evaluator.tsx
git commit -m "feat: add chat message list and bubble styles to Evaluator"
```

---

## Task 4: Build the input bar and send handler with streaming

**Files:**
- Modify: `components/Evaluator.tsx`

Replace the "Input coming soon" placeholder with a working textarea + send button. Wire up the Anthropic streaming call.

- [ ] **Step 1: Add `handleSend` function**

Add this function inside the component body, before `return`:

```tsx
  async function handleSend() {
    const apiKey = getApiKey()
    if (!apiKey) {
      setError('No API key set. Add your Claude API key in Settings.')
      return
    }
    const trimmed = input.trim()
    if (!trimmed || busy) return

    setError(null)
    const userMessage: Message = { role: 'user', content: trimmed }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setStreaming(true)
    setDisplayBuffer('')

    try {
      const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })

      // Build the messages array for the API — include all history
      // The seeded assistant opening is already in `messages`
      const apiMessages = updatedMessages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))

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

      // Finalize: move display buffer into messages
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

- [ ] **Step 2: Replace the "Input coming soon" div with the real input bar**

Replace:
```tsx
          <div style={{ borderTop: '1px solid var(--border)', padding: '0.75rem' }}>
            <p style={{ color: 'var(--fg-comment)', fontSize: '0.875rem' }}>Input coming soon</p>
          </div>
```

With:
```tsx
          {/* Wrap-up banner — implemented in Task 5 */}

          {/* Input bar */}
          <div style={{
            borderTop: '1px solid var(--border)',
            padding: '0.75rem',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'flex-end',
            background: 'var(--bg-alt)',
          }}>
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
              rows={2}
              disabled={busy}
              style={{
                flex: 1,
                fontFamily: 'inherit',
                fontSize: '0.875rem',
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: busy ? 'var(--bg-highlight)' : 'var(--bg)',
                color: 'var(--fg)',
                resize: 'none',
                outline: 'none',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <button
                onClick={handleSend}
                disabled={busy || !input.trim()}
                style={{
                  padding: '7px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: busy || !input.trim() ? 'var(--bg-highlight)' : 'var(--purple)',
                  color: busy || !input.trim() ? 'var(--fg-gutter)' : 'white',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: busy || !input.trim() ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {streaming ? 'Sending…' : 'Send'}
              </button>
              <button
                onClick={handleWrapUp}
                disabled={busy}
                style={{
                  padding: '7px 16px',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: busy ? 'var(--fg-gutter)' : 'var(--fg-alt)',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  cursor: busy ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Wrap up
              </button>
            </div>
          </div>
```

- [ ] **Step 3: Add a temporary `handleWrapUp` stub** (full implementation in Task 6)

Add before `return`:
```tsx
  async function handleWrapUp() {
    // Implemented in Task 6
  }
```

- [ ] **Step 4: Verify in browser**

```bash
pnpm dev
```

Navigate to a fundamentals page. Verify:
- Textarea and Send / Wrap up buttons appear
- Typing a response and pressing Enter (or Send) sends the message
- User bubble appears right-aligned in purple tint
- AI response streams in on the left
- "thinking…" appears briefly while waiting for first chunk
- Input clears after send, Send button disabled during streaming

- [ ] **Step 5: Commit**

```bash
git add components/Evaluator.tsx
git commit -m "feat: add streaming send handler and input bar to chat Evaluator"
```

---

## Task 5: Implement wrap-up banner

**Files:**
- Modify: `components/Evaluator.tsx`

When the AI appends `[[WRAP_SUGGESTED]]` and the user has not dismissed, show a banner above the input bar.

- [ ] **Step 1: Add the banner just above the input bar**

Find the comment `{/* Wrap-up banner — implemented in Task 5 */}` and replace it with:

```tsx
          {/* Wrap-up banner */}
          {wrapUpSuggested && !wrapUpDismissed && (
            <div style={{
              borderTop: '1px solid var(--border)',
              padding: '0.625rem 0.75rem',
              background: 'var(--blue-tint)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
            }}>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--fg-alt)' }}>
                Looks like we&apos;ve covered the main ideas — ready for a summary?
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <button
                  onClick={handleWrapUp}
                  disabled={busy}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '5px',
                    border: 'none',
                    background: 'var(--blue)',
                    color: 'white',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: busy ? 'not-allowed' : 'pointer',
                  }}
                >
                  Yes, wrap up
                </button>
                <button
                  onClick={() => setWrapUpDismissed(true)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '5px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg)',
                    color: 'var(--fg-alt)',
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                  }}
                >
                  Keep going
                </button>
              </div>
            </div>
          )}
```

- [ ] **Step 2: Verify in browser**

To test the banner without waiting for the AI to trigger it:
1. Temporarily add `setWrapUpSuggested(true)` at the top of `handleSend`
2. Send any message — the banner should appear above the input bar
3. Click "Keep going" — banner disappears, conversation continues
4. Remove the temporary line and save

- [ ] **Step 3: Commit**

```bash
git add components/Evaluator.tsx
git commit -m "feat: add wrap-up suggestion banner with dismiss support"
```

---

## Task 6: Implement summary generation and summary card

**Files:**
- Modify: `components/Evaluator.tsx`

Replace `handleWrapUp` stub with a real implementation. Replace the `<div>Summary coming soon</div>` with the summary card.

- [ ] **Step 1: Replace `handleWrapUp` stub with real implementation**

```tsx
  async function handleWrapUp() {
    const apiKey = getApiKey()
    if (!apiKey) {
      setError('No API key set. Add your Claude API key in Settings.')
      return
    }
    if (busy) return

    setError(null)
    setSummarizing(true)

    try {
      const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })

      const summarySystemPrompt = `You are evaluating a learner's understanding based on the conversation below.
Return ONLY a valid JSON object — no markdown, no code fences, no extra text.
Shape:
{
  "strengths": ["what the learner demonstrated well", ...],
  "reinforce": ["concepts that need more work", ...],
  "lookUp": "one specific thing the learner should read about next"
}`

      const apiMessages = messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))

      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: summarySystemPrompt,
        messages: [
          ...apiMessages,
          { role: 'user', content: 'Please summarize this conversation.' },
        ],
      })

      const raw = response.content[0].type === 'text' ? response.content[0].text : ''
      const text = raw.replace(/^```(?:json)?\s*/m, '').replace(/\s*```$/m, '').trim()
      const parsed: SummaryResult = JSON.parse(text)
      setSummary(parsed)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      setError(`Summary failed: ${msg}. Try again or keep going.`)
    } finally {
      setSummarizing(false)
    }
  }
```

- [ ] **Step 2: Replace summary placeholder with the summary card**

Find `<div>Summary coming soon</div>` and replace with:

```tsx
        <div style={{
          border: '1px solid var(--border)',
          borderRadius: '0.75rem',
          overflow: 'hidden',
          background: 'var(--bg)',
        }}>
          {/* Summary card */}
          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {summary.strengths.length > 0 && (
              <div>
                <p style={{
                  fontFamily: 'ui-monospace, monospace', fontSize: '0.65rem', fontWeight: 700,
                  letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: '0.5rem',
                }}>
                  What you covered well
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  {summary.strengths.map((s, i) => (
                    <li key={i} style={{ fontSize: '0.875rem', color: 'var(--fg)', marginBottom: '0.25rem' }}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {summary.reinforce.length > 0 && (
              <div>
                <p style={{
                  fontFamily: 'ui-monospace, monospace', fontSize: '0.65rem', fontWeight: 700,
                  letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: '0.5rem',
                }}>
                  Worth reinforcing
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  {summary.reinforce.map((r, i) => (
                    <li key={i} style={{ fontSize: '0.875rem', color: 'var(--fg)', marginBottom: '0.25rem' }}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {summary.lookUp && (
              <div style={{
                padding: '10px 14px', borderRadius: '6px',
                background: 'var(--blue-tint)', border: '1px solid color-mix(in srgb, var(--blue) 20%, transparent)',
              }}>
                <p style={{
                  fontFamily: 'ui-monospace, monospace', fontSize: '0.65rem', fontWeight: 700,
                  letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '0.375rem',
                }}>
                  One thing to look up
                </p>
                <p style={{ fontSize: '0.9375rem', color: 'var(--fg)', margin: 0 }}>{summary.lookUp}</p>
              </div>
            )}

            <button
              onClick={handleReset}
              style={{
                alignSelf: 'flex-start',
                padding: '7px 16px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: 'var(--bg-alt)',
                color: 'var(--fg-alt)',
                fontSize: '0.8125rem',
                cursor: 'pointer',
              }}
            >
              ↩ Start over
            </button>
          </div>
        </div>
```

- [ ] **Step 3: Add summarizing spinner in the chat container**

Inside the non-summary branch, wrap the message list + input bar with a condition so the spinner shows during summary generation. Find the outer `<div>` that wraps the scroll container (the one with `border: '1px solid var(--border)'`) and add this just inside it, before the message list div:

```tsx
          {summarizing && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'color-mix(in srgb, var(--bg) 85%, transparent)',
              borderRadius: '0.75rem',
              zIndex: 10,
            }}>
              <p style={{ color: 'var(--fg-comment)', fontSize: '0.875rem', fontStyle: 'italic' }}>
                Generating summary…
              </p>
            </div>
          )}
```

Also add `position: 'relative'` to the **chat box div** — specifically the `<div>` with `border: '1px solid var(--border)'` and `borderRadius: '0.75rem'` that wraps the message list, banner, and input bar. Do not add it to the outermost wrapper div (the one after `return`), or the overlay will escape the chat box.

- [ ] **Step 4: Verify in browser**

```bash
pnpm dev
```

Have a short conversation, then click "Wrap up". Verify:
- "Generating summary…" overlay appears
- Summary card replaces the chat with green/orange/blue sections
- "↩ Start over" button resets to the opening question

- [ ] **Step 5: Commit**

```bash
git add components/Evaluator.tsx
git commit -m "feat: add summary generation and summary card to chat Evaluator"
```

---

## Task 7: Final verification and cleanup

**Files:**
- Modify: `components/Evaluator.tsx` (cleanup only if needed)

- [ ] **Step 1: Full end-to-end test on a fundamentals page**

```bash
pnpm dev
```

Walk through the complete flow:
1. Navigate to `/fundamentals/data-modeling` (or any page with an Evaluator)
2. Read the opening AI question
3. Type a partial answer — verify AI responds with a hint, not an answer dump
4. Type an off-topic response — verify AI redirects
5. Continue until the AI suggests wrapping up — verify banner appears
6. Click "Keep going" — verify banner disappears and conversation continues
7. Click "Wrap up" button — verify summary card appears
8. Click "↩ Start over" — verify chat resets to the original opening question

- [ ] **Step 2: Check scenarios page also works**

Navigate to `/scenarios/[any-slug]` — the `Evaluator` component is used there too. Verify same behavior.

- [ ] **Step 3: Test error state**

In browser dev tools, temporarily block network requests to `api.anthropic.com`. Send a message. Verify the error message appears below the chat container (not crashing the page).

- [ ] **Step 4: Final commit**

```bash
git add components/Evaluator.tsx
git commit -m "feat: complete conversational chat Evaluator replacement"
```

---

## Reference: Complete Evaluator.tsx shape

After all tasks, the file structure should be:

```
'use client'

imports (useState, useRef, useEffect, ReactMarkdown, getApiKey, Anthropic, stripWrapToken)

interfaces (EvaluatorProps, Message, SummaryResult)

const INITIAL_QUESTION
function buildSystemPrompt(...)

export default function Evaluator({ promptContent, phase, question }) {
  const openingMessage = ...
  // all useState declarations
  const scrollRef = useRef
  useEffect (auto-scroll)
  const busy = ...
  function handleReset() { ... }
  async function handleSend() { ... }
  async function handleWrapUp() { ... }

  // style constants (aiBubbleStyle, userBubbleStyle)

  return (
    <div> // outer wrapper
      <p> // "Check your understanding" label

      {summary ? (
        // Summary card
      ) : (
        <div> // chat container, position: relative
          {summarizing && <div> // spinner overlay }
          <div ref={scrollRef}> // message list, overflow-y: auto
            // messages.map(...)
            // streaming bubble
            // typing indicator
          </div>
          // wrap-up banner (conditional)
          // input bar
        </div>
      )}

      {error && <p>...</p>}
    </div>
  )
}
```
