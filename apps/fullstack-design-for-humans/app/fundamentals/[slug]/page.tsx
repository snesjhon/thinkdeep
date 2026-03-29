import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  getFundamentalsGuide,
  getAllFundamentalsSlugs,
  getSectionForFundamentals,
  getPrecedingSection,
} from '@/lib/fundamentals'
import { extractHeadings } from '@/lib/headings'
import { TableOfContents } from '@for-humans/ui'
import MarkdownRenderer from '@/components/MarkdownRenderer'

const PHASE_COLORS = ['var(--purple)', 'var(--blue)', 'var(--green)', 'var(--orange)', 'var(--cyan)']
const phaseColor = (n: number) => PHASE_COLORS[(n - 1) % PHASE_COLORS.length]

interface Props {
  params: { slug: string }
}

export function generateStaticParams() {
  return getAllFundamentalsSlugs().map((slug) => ({ slug }))
}

export default function FundamentalsPage({ params }: Props) {
  const guide = getFundamentalsGuide(params.slug)
  if (!guide) notFound()

  const context = getSectionForFundamentals(params.slug)
  const section = context?.section
  const phase = context?.phase
  const prereq = getPrecedingSection(params.slug)
  const color = phase ? phaseColor(phase.number) : null

  const strippedContent = guide.content.replace(/^#[^#].*\n+/, '').trimStart()
  const headings = extractHeadings(strippedContent)

  const heroGradient =
    'linear-gradient(150deg, color-mix(in srgb, var(--purple) 10%, var(--bg)) 0%, color-mix(in srgb, var(--blue) 6%, var(--bg)) 50%, var(--bg) 90%)'

  return (
    <>
      <section
        className="-mt-28 px-10 pt-28 pb-12 border-b border-b-[var(--border)]"
        style={{ background: heroGradient }}
      >
        <div className="block lg:grid gap-x-24 lg:grid-cols-[350px_minmax(250px,0.8fr)]">
          <div className="hidden lg:block" />
          <div>
            <div className="flex items-center gap-2 mb-3">
              {phase && (
                <span className="text-xs text-[var(--fg-gutter)]">
                  {phase.emoji} {phase.label}
                </span>
              )}
            </div>
            <h1 className="text-5xl font-bold leading-tight text-[var(--fg)] font-display">
              {section?.label ?? guide.title.replace(/\s*[–-]\s*Fundamentals/i, '')}
            </h1>
            {section && (
              <p className="mt-3 text-lg italic leading-snug text-[var(--purple)]">
                &quot;{section.mentalModelHook}&quot;
              </p>
            )}
          </div>
        </div>
      </section>

      <div style={{ background: color ? `color-mix(in srgb, ${color} 8%, var(--bg))` : 'var(--bg)' }}>
        <div className="block lg:grid items-start gap-x-24 px-10 py-10 lg:grid-cols-[350px_minmax(250px,0.8fr)]">
          <aside className="hidden lg:block sticky top-20 self-start max-h-[calc(100vh-5rem)] overflow-y-auto">
            <TableOfContents headings={headings} title="Contents" />
          </aside>

          <section className="min-w-0 space-y-8">
            <div className="rounded-xl p-5 bg-[var(--bg-alt)] border border-[var(--border)]">
              <p className="text-sm mb-1 text-[var(--fg-alt)]">
                <span className="font-semibold text-[var(--fg)]">Prerequisites:</span>
              </p>
              {prereq ? (
                <Link
                  href={prereq.fundamentalsSlug ? `/fundamentals/${prereq.fundamentalsSlug}` : '/path'}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80 mt-2 bg-[var(--purple-tint)] text-[var(--purple)]"
                  style={{ border: '1px solid color-mix(in srgb, var(--purple) 20%, transparent)' }}
                >
                  {prereq.label} Fundamentals
                </Link>
              ) : (
                <p className="text-sm italic mb-1 text-[var(--fg-comment)]">
                  None — this is the starting point of the path.
                </p>
              )}
            </div>

            <MarkdownRenderer
              content={strippedContent}
              prompts={guide.levelPrompts}
              phase={phase?.number ?? 1}
              storageKeyPrefix={`chat:${params.slug}`}
            />

            <div className="flex items-center justify-between pt-8 border-t border-t-[var(--border)]">
              <Link href="/path" className="text-sm transition-opacity hover:opacity-70 text-[var(--fg-comment)]">
                ← Back to The Path
              </Link>
              {section && section.firstPass.length > 0 && (
                <Link
                  href={`/scenarios/${section.firstPass[0].slug}`}
                  className="text-sm px-4 py-2 rounded-lg font-medium transition-opacity hover:opacity-90 text-white bg-[var(--blue)]"
                >
                  Start First Scenario →
                </Link>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
