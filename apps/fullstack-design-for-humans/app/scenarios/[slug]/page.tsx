import { notFound } from 'next/navigation'
import Link from 'next/link'
import { loadScenario, getAllScenarioSlugsFromDisk } from '@/lib/content'
import { getScenarioBySlug } from '@/lib/journey'
import { extractHeadings } from '@/lib/headings'
import { TableOfContents } from '@for-humans/ui'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import CheckWork from '@/components/CheckWork'

const PHASE_COLORS = ['var(--purple)', 'var(--blue)', 'var(--green)', 'var(--orange)', 'var(--cyan)']
const phaseColor = (n: number) => PHASE_COLORS[(n - 1) % PHASE_COLORS.length]

interface Props {
  params: { slug: string }
}

export function generateStaticParams() {
  return getAllScenarioSlugsFromDisk().map((slug) => ({ slug }))
}

export default function ScenarioPage({ params }: Props) {
  const content = loadScenario(params.slug)
  if (!content) notFound()

  const match = getScenarioBySlug(params.slug)
  if (!match) notFound()

  const { scenario, section, phase } = match
  const color = phaseColor(phase.number)

  const strippedBrief = content.brief.replace(/^#[^#].*\n+/, '').trimStart()
  const strippedWalkthrough = content.walkthrough
    ? content.walkthrough.replace(/^#[^#].*\n+/, '').trimStart()
    : null

  const tocContent = strippedWalkthrough ?? strippedBrief
  const headings = extractHeadings(tocContent)

  const allScenarios = [...section.firstPass, ...section.reinforce]
  const idx = allScenarios.findIndex((s) => s.slug === params.slug)
  const prevScenario = idx > 0 ? allScenarios[idx - 1] : null
  const nextScenario = idx < allScenarios.length - 1 ? allScenarios[idx + 1] : null

  return (
    <>
      <section
        className="-mt-28 px-10 pt-28 pb-12 border-b border-b-[var(--border)]"
        style={{ background: 'linear-gradient(150deg, color-mix(in srgb, var(--purple) 10%, var(--bg)) 0%, color-mix(in srgb, var(--blue) 6%, var(--bg)) 50%, var(--bg) 90%)' }}
      >
        <div className="block lg:grid gap-x-24 lg:grid-cols-[280px_minmax(250px,0.9fr)]">
          <div className="hidden lg:block" />
          <div>
            <p className="text-xs font-mono mb-2 text-[var(--fg-gutter)]">{section.label}</p>
            <h1 className="text-5xl font-bold leading-tight text-[var(--fg)]">{scenario.label}</h1>
          </div>
        </div>
      </section>

      <div style={{ background: `color-mix(in srgb, ${color} 8%, var(--bg))` }}>
        <div className="block lg:grid items-start gap-x-24 px-10 py-10 lg:grid-cols-[280px_minmax(250px,0.9fr)]">
          <aside className="hidden lg:block sticky top-20 self-start max-h-[calc(100vh-5rem)] overflow-y-auto">
            <TableOfContents headings={headings} title="Contents" />
            <CheckWork slug={params.slug} />
          </aside>

          <section className="min-w-0 space-y-8">
            <div className="rounded-xl p-6 bg-[var(--bg-alt)] border border-[var(--border)]">
              <p className="text-xs font-semibold uppercase mb-4 text-[var(--fg-gutter)] font-[ui-monospace,monospace] tracking-[0.08em]">
                Your task
              </p>
              <MarkdownRenderer
                content={strippedBrief}
                prompts={content.promptContent}
                phase={phase.number}
                storageKeyPrefix={`chat:${params.slug}`}
              />
            </div>

            {strippedWalkthrough && (
              <MarkdownRenderer
                content={strippedWalkthrough}
                prompts={content.promptContent}
                phase={phase.number}
                storageKeyPrefix={`chat:${params.slug}`}
              />
            )}

            <div className="flex items-center justify-between pt-6 border-t border-t-[var(--border)]">
              {prevScenario ? (
                <Link href={`/scenarios/${prevScenario.slug}`} className="flex items-center gap-2 text-sm hover:opacity-70 text-[var(--fg-comment)]">
                  ← {prevScenario.label}
                </Link>
              ) : (
                <Link href="/path" className="flex items-center gap-2 text-sm hover:opacity-70 text-[var(--fg-comment)]">
                  ← The Path
                </Link>
              )}
              {nextScenario ? (
                <Link href={`/scenarios/${nextScenario.slug}`} className="flex items-center gap-2 text-sm hover:opacity-70 text-[var(--fg-comment)]">
                  {nextScenario.label} →
                </Link>
              ) : (
                <div />
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
