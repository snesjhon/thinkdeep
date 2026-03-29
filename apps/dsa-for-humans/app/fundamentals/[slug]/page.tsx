import { notFound } from 'next/navigation';

const PHASE_COLORS = [
  'var(--purple)',
  'var(--blue)',
  'var(--green)',
  'var(--orange)',
  'var(--cyan)',
];
const phaseColor = (n: number) => PHASE_COLORS[(n - 1) % PHASE_COLORS.length];
import Link from 'next/link';
import {
  getFundamentalsGuide,
  getAllFundamentalsSlugs,
  getSectionForFundamentals,
  getPrecedingSection,
} from '@/lib/fundamentals';
import { extractHeadings } from '@/lib/headings';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { TableOfContents, PhaseColorSync } from '@for-humans/ui';

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return getAllFundamentalsSlugs().map((slug) => ({ slug }));
}

export default function FundamentalsPage({ params }: Props) {
  const guide = getFundamentalsGuide(params.slug);
  if (!guide) notFound();

  const context = getSectionForFundamentals(params.slug);
  const section = context?.section;
  const phase = context?.phase;
  const prereq = getPrecedingSection(params.slug);
  const color = phase ? phaseColor(phase.number) : null;
  const headings = extractHeadings(guide.content);

  const heroGradient =
    'linear-gradient(150deg, color-mix(in srgb, var(--purple) 10%, var(--bg)) 0%, color-mix(in srgb, var(--blue) 6%, var(--bg)) 50%, var(--bg) 90%)';

  return (
    <>
      {color && <PhaseColorSync color={color} />}
      <section
        className="-mt-28 px-10 pt-28 border-b border-b-[var(--border)]"
        style={{ background: heroGradient }}
      >
        <div className="flex flex-col items-center py-10">
          <h1 className="text-5xl leading-tight text-[var(--fg)] font-display mb-0">
            {section?.label ??
              guide.title.replace(/\s*[–-]\s*Fundamentals/i, '')}
          </h1>
          {section && (
            <p className="text-lg italic leading-snug text-[var(--cyan)] mb-6">
              &ldquo;{section.mentalModelHook}&rdquo;
            </p>
          )}

          <div className="flex items-center gap-2">
            {phase && (
              <mark className="text-xs bg-transparent border border-[var(--border)] rounded text-[var(--fg-alt)]">
                {phase.emoji} {phase.label}
              </mark>
            )}
            <mark className="text-xs bg-transparent border border-[var(--border)] rounded text-[var(--fg-alt)]">
              Fundamentals
            </mark>
          </div>
        </div>
      </section>

      <div
        style={{
          background: color
            ? `color-mix(in srgb, ${color} 8%, var(--bg))`
            : 'var(--bg)',
        }}
      >
        <div className="block lg:grid items-start gap-12 px-10 py-10 lg:grid-cols-[0.3fr_minmax(250px,1fr)]">
          <aside className="hidden lg:block sticky top-20 self-start max-h-[calc(100vh-5rem)] overflow-y-auto">
            <TableOfContents headings={headings} title="Contents" />
          </aside>

          <section className="min-w-0 space-y-8 py-2">
            <div className="rounded-xl p-5 bg-[var(--bg-alt)] border border-[var(--border)]">
              <p className="text-sm mb-1 text-[var(--fg-alt)]">
                <span className="font-semibold text-[var(--fg)]">
                  Prerequisites:
                </span>
              </p>
              {prereq ? (
                <Link
                  href={
                    prereq.fundamentalsSlug
                      ? `/fundamentals/${prereq.fundamentalsSlug}`
                      : '/'
                  }
                  className="inline-flex 
                  items-center gap-1.5 text-xs 
                  font-medium px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80 mt-2 bg-[var(--purple-tint)] text-[var(--purple)] no-underline border border-[var(--border)]"
                >
                  {prereq.label} Fundamentals
                </Link>
              ) : (
                <p className="text-sm italic mt-1 text-[var(--fg-comment)] mb-0">
                  None — this is the starting point of the path.
                </p>
              )}
            </div>
            <MarkdownRenderer
              content={guide.content}
              fundamentalsSlug={params.slug}
            />
            <div className="flex items-center justify-between pt-8 border-t border-t-[var(--border)]">
              <Link
                href="/"
                className="text-sm transition-opacity hover:opacity-70 text-[var(--fg-comment)]"
              >
                ← Back to Learning Path
              </Link>
              {section && section.firstPass.length > 0 && (
                <Link
                  href={`/problems/${section.firstPass[0].id}`}
                  className="text-sm px-4 py-2 rounded-lg font-medium transition-opacity hover:opacity-90 text-white bg-[var(--blue)]"
                >
                  Start First Problem →
                </Link>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
