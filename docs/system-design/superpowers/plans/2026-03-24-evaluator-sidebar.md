# Evaluator Sidebar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the inline Evaluator into a minimal inline card ("Discuss it" button) that opens a fixed right-side chat sidebar via Framer Motion slide animation.

**Architecture:** Split `Evaluator.tsx` into two components: a thin inline card that owns `isOpen` state, and a new `ChatSidebar.tsx` that owns all conversation logic and renders via `createPortal` into `document.body`. All chat logic (state, streaming, summary) moves verbatim from the current Evaluator into ChatSidebar.

**Tech Stack:** Next.js 14, React 18, `framer-motion` (AnimatePresence + motion.div), `react-dom` (createPortal), `@anthropic-ai/sdk`, `react-markdown`, inline styles with CSS custom properties.

**Do NOT run any git commands or commits.**

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `components/ChatSidebar.tsx` | Fixed panel + backdrop + all chat logic |
| Modify | `components/Evaluator.tsx` | Thin inline card: question bubble + "Discuss it" button |

`lib/chat.ts` — unchanged.

---

## Task 1: Create `components/ChatSidebar.tsx`

**Files:**
- Create: `components/ChatSidebar.tsx`

All chat logic moves here from `Evaluator.tsx`. The component renders nothing during SSR (portal requires `document.body`) and uses `AnimatePresence` internally to animate the backdrop and panel in/out.

- [ ] **Step 1: Create `components/ChatSidebar.tsx` with the full implementation**

Write the file with these exact contents:

```tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { getApiKey } from '@/lib/apiKey'
import Anthropic from '@anthropic-ai/sdk'
import { stripWrapToken } from '@/lib/chat'

export interface ChatSidebarProps {
  isOpen: boolean
  onClose: () => void
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

const aiBubbleStyle: React.CSSProperties = {
  maxWidth: '85%',
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
  maxWidth: '85%',
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

export default function ChatSidebar({ isOpen, onClose, promptContent, phase, question }: ChatSidebarProps) {
  const openingMessage = question ?? INITIAL_QUESTION

  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: openingMessage },
  ])
  const [displayBuffer, setDisplayBuffer] = useState('')
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [summarizing, setSummarizing] = useState(false)
  const [wrapUpSuggested, setWrapUpSuggested] = useState(false)
  // Once dismissed, stays dismissed for the session even if AI sends [[WRAP_SUGGESTED]] again.
  // If re-detection on a second AI signal is ever needed, reset this when wrapUpSuggested fires.
  const [wrapUpDismissed, setWrapUpDismissed] = useState(false)
  const [summary, setSummary] = useState<SummaryResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, displayBuffer])

  const busy = streaming || summarizing

  // Resets all chat state and closes the sidebar
  function handleClose() {
    setMessages([{ role: 'assistant', content: openingMessage }])
    setDisplayBuffer('')
    setInput('')
    setStreaming(false)
    setSummarizing(false)
    setWrapUpSuggested(false)
    setWrapUpDismissed(false)
    setSummary(null)
    setError(null)
    onClose()
  }

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

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 49,
              background: 'color-mix(in srgb, var(--fg) 20%, transparent)',
            }}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position: 'fixed',
              right: 0,
              top: 0,
              width: '420px',
              height: '100vh',
              zIndex: 50,
              background: 'var(--bg)',
              borderLeft: '1px solid var(--border)',
              boxShadow: '-4px 0 24px color-mix(in srgb, var(--fg) 8%, transparent)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 1rem',
              height: '52px',
              borderBottom: '1px solid var(--border)',
              flexShrink: 0,
            }}>
              <p style={{
                fontFamily: 'ui-monospace, monospace',
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--fg-gutter)',
                margin: 0,
              }}>
                Discuss it
              </p>
              <button
                onClick={handleClose}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--fg-comment)',
                  fontSize: '1.25rem',
                  lineHeight: 1,
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Content area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
              {summarizing && (
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'color-mix(in srgb, var(--bg) 85%, transparent)',
                  zIndex: 10,
                }}>
                  <p style={{ color: 'var(--fg-comment)', fontSize: '0.875rem', fontStyle: 'italic' }}>
                    Generating summary…
                  </p>
                </div>
              )}

              {summary ? (
                /* Summary card */
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
                    onClick={handleClose}
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
              ) : (
                <>
                  {/* Message list */}
                  <div
                    ref={scrollRef}
                    style={{
                      flex: 1,
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

                    {streaming && displayBuffer && (
                      <div style={aiBubbleStyle}>
                        <ReactMarkdown>{displayBuffer}</ReactMarkdown>
                      </div>
                    )}

                    {streaming && !displayBuffer && (
                      <div style={{ ...aiBubbleStyle, color: 'var(--fg-gutter)', fontStyle: 'italic' }}>
                        thinking…
                      </div>
                    )}
                  </div>

                  {/* Error display — inside sidebar, above input bar */}
                  {error && (
                    <div style={{ padding: '0.5rem 0.75rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', background: 'var(--bg-alt)' }}>
                      <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--red, #e06c75)' }}>
                        {error}{' '}
                        {error.includes('API key') && (
                          <a href="/settings" style={{ color: 'var(--purple)' }}>Go to Settings →</a>
                        )}
                      </p>
                      {error.includes('Summary failed') && (
                        <button
                          onClick={handleWrapUp}
                          disabled={busy}
                          style={{
                            padding: '4px 12px',
                            borderRadius: '5px',
                            border: '1px solid var(--border)',
                            background: 'var(--bg)',
                            color: 'var(--fg-alt)',
                            fontSize: '0.8125rem',
                            cursor: busy ? 'not-allowed' : 'pointer',
                          }}
                        >
                          Retry summary
                        </button>
                      )}
                    </div>
                  )}

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
                      flexShrink: 0,
                    }}>
                      <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--fg-alt)' }}>
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

                  {/* Input bar */}
                  <div style={{
                    borderTop: '1px solid var(--border)',
                    padding: '0.75rem',
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'flex-end',
                    background: 'var(--bg-alt)',
                    flexShrink: 0,
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
                      rows={1}
                      onInput={e => {
                        e.currentTarget.style.height = 'auto'
                        e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px'
                      }}
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
                        overflow: 'hidden',
                        minHeight: '38px',
                        maxHeight: '120px',
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
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles cleanly**

```bash
cd /Users/snesjhon/Developer/system-design-for-humans && pnpm build 2>&1 | head -60
```

Expected: `✓ Compiled successfully` with no type errors. The `document.body` reference is safe here because `'use client'` ensures this file never runs on the server.

---

## Task 2: Simplify `components/Evaluator.tsx` to inline card

**Files:**
- Modify: `components/Evaluator.tsx`

Replace the entire file. All chat logic is now in `ChatSidebar`. Evaluator owns only `isOpen`.

- [ ] **Step 1: Replace `components/Evaluator.tsx` entirely**

```tsx
'use client'

import { useState } from 'react'
import ChatSidebar from './ChatSidebar'

interface EvaluatorProps {
  promptContent: string
  phase: number
  question?: string
}

export default function Evaluator({ promptContent, phase, question }: EvaluatorProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
      <p style={{
        fontFamily: 'ui-monospace, monospace', fontSize: '0.65rem', fontWeight: 700,
        letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-gutter)', marginBottom: '1rem',
      }}>
        Check your understanding
      </p>

      {question && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: '0.75rem',
          marginBottom: '1rem',
          background: 'var(--purple-tint)',
          border: '1px solid color-mix(in srgb, var(--purple) 25%, transparent)',
        }}>
          <p style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--fg)', margin: 0, lineHeight: 1.6 }}>
            {question}
          </p>
        </div>
      )}

      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: '8px 20px',
          borderRadius: '6px',
          background: 'var(--purple)',
          color: 'white',
          fontSize: '0.875rem',
          fontWeight: 600,
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Discuss it →
      </button>

      <ChatSidebar
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        promptContent={promptContent}
        phase={phase}
        question={question}
      />
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles cleanly**

```bash
cd /Users/snesjhon/Developer/system-design-for-humans && pnpm build 2>&1 | head -60
```

Expected: `✓ Compiled successfully`. Both `app/fundamentals/[slug]/page.tsx` and `app/scenarios/[slug]/page.tsx` call `<Evaluator>` with the same props interface — no changes needed there.

- [ ] **Step 3: Verify in browser**

```bash
pnpm dev
```

Navigate to any fundamentals page. Verify:
1. "CHECK YOUR UNDERSTANDING" label + question bubble + "Discuss it →" button appear inline
2. Clicking "Discuss it →" — backdrop fades in, sidebar slides in from the right
3. Chat works: type a message, press Enter, AI streams a response
4. Wrap-up banner appears when AI finishes topic; "Keep going" dismisses it
5. "Wrap up" button generates and shows summary card
6. Clicking backdrop OR ✕ closes the sidebar with slide-out animation
7. Reopening the sidebar starts a fresh conversation (state was reset on close)
8. "↩ Start over" on summary card closes the sidebar and resets state
