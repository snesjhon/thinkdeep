import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  loadScenario,
  getAllScenarioSlugsFromDisk,
} from '@/lib/system-design/content';
import { getScenarioBySlug } from '@/lib/system-design/journey';
import { extractHeadings } from '@/lib/system-design/headings';
import TableOfContents from '@/components/ui/TableOfContents/TableOfContents';
import { PageHero } from '@/components/ui/PageHero/PageHero';
import { TDPageLayout } from '@/components/ui/TDPageLayout/TDPageLayout';
import { ProgressProvider } from '@/components/ui/ProgressProvider/ProgressProvider';
import TDCompletionCTA from '@/components/ui/TDCompletionCTA/TDCompletionCTA';
import TDProgressPanel from '@/components/ui/TDProgressPanel/TDProgressPanel';
import MarkdownRenderer from '@/components/system-design/MarkdownRenderer/MarkdownRenderer';

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return getAllScenarioSlugsFromDisk().map((slug) => ({ slug }));
}

export default function ScenarioPage({ params }: Props) {
  const content = loadScenario(params.slug);
  if (!content) notFound();

  const match = getScenarioBySlug(params.slug);
  if (!match) notFound();

  const { scenario, section, phase } = match;

  const strippedBrief = content.brief.replace(/^#[^#].*\n+/, '').trimStart();
  const strippedWalkthrough = content.walkthrough
    ? content.walkthrough.replace(/^#[^#].*\n+/, '').trimStart()
    : null;

  const tocContent = strippedWalkthrough ?? strippedBrief;
  const headings = extractHeadings(tocContent);

  const allScenarios = [...section.firstPass, ...section.reinforce];
  const idx = allScenarios.findIndex((s) => s.slug === params.slug);
  const prevScenario = idx > 0 ? allScenarios[idx - 1] : null;
  const nextScenario =
    idx < allScenarios.length - 1 ? allScenarios[idx + 1] : null;

  return (
    <ProgressProvider
      items={[{ itemType: 'problem', itemId: `sd-${params.slug}` }]}
    >
      <TDPageLayout
        hero={
          <PageHero>
            <h1 className="text-5xl font-display leading-tight text-[var(--ms-text-body)] mb-0">
              {scenario.label}
            </h1>
            <p className="text-md italic leading-snug text-[var(--ms-primary)] mb-6">
              &ldquo;{section.mentalModelHook}&rdquo;
            </p>

            <div className="flex items-center gap-2">
              <mark className="text-xs bg-transparent border border-[var(--ms-surface)] rounded text-[var(--ms-text-muted)]">
                {phase.emoji} {phase.label}
              </mark>
              <mark className="text-xs bg-transparent border border-[var(--ms-surface)] rounded text-[var(--ms-text-muted)]">
                Scenario
              </mark>
            </div>
          </PageHero>
        }
        progress={
          <TDProgressPanel
            loginHref={`/login?next=${encodeURIComponent(`/system-design/scenarios/${params.slug}`)}`}
            items={[
              {
                itemType: 'problem',
                itemId: `sd-${params.slug}`,
                label: 'Scenario complete',
              },
            ]}
          />
        }
        aside={
          <>
            <TableOfContents headings={headings} title="Contents" />
            {scenario.relatedFundamentalsSlugs.length > 0 && (
              <div className="mt-8">
                <p className="text-sm font-semibold mb-3 text-[var(--ms-text-body)]">
                  Concepts
                </p>
                <div className="space-y-1">
                  {scenario.relatedFundamentalsSlugs.map((slug) => (
                    <Link
                      key={slug}
                      href={`/system-design/fundamentals/${slug}`}
                      className="block rounded-md px-2 py-1.5 text-sm text-[var(--ms-text-subtle)] transition-colors no-underline hover:opacity-80"
                    >
                      {slug.replace(/-/g, ' ')}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        }
      >
        <section className="space-y-8">
          <div className="rounded-xl border border-[var(--ms-surface)] bg-[var(--ms-bg-pane-secondary)] p-6">
            <p className="mb-4 font-[ui-monospace,monospace] text-xs font-semibold uppercase tracking-[0.08em] text-[var(--ms-text-faint)]">
              Requirements
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

          <div className="flex items-center justify-between border-t border-t-[var(--ms-surface)] pt-6">
            {prevScenario ? (
              <Link
                href={`/system-design/scenarios/${prevScenario.slug}`}
                className="flex items-center gap-2 text-sm text-[var(--ms-text-subtle)] transition-opacity hover:opacity-70"
              >
                ← {prevScenario.label}
              </Link>
            ) : (
              <Link
                href={
                  section.fundamentalsSlug
                    ? `/system-design/fundamentals/${section.fundamentalsSlug}`
                    : '/system-design/path'
                }
                className="flex items-center gap-2 text-sm text-[var(--ms-text-subtle)] transition-opacity hover:opacity-70"
              >
                ← {section.label} Fundamentals
              </Link>
            )}
            <TDCompletionCTA
              itemType="problem"
              itemId={`sd-${params.slug}`}
              label="Complete Scenario"
              completedLabel="Scenario Completed"
              loginHref={`/login?next=${encodeURIComponent(`/system-design/scenarios/${params.slug}`)}`}
            />
            {nextScenario ? (
              <Link
                href={`/system-design/scenarios/${nextScenario.slug}`}
                className="flex items-center gap-2 text-sm text-[var(--ms-text-subtle)] transition-opacity hover:opacity-70"
              >
                {nextScenario.label} →
              </Link>
            ) : (
              <div />
            )}
          </div>
        </section>
      </TDPageLayout>
    </ProgressProvider>
  );
}
