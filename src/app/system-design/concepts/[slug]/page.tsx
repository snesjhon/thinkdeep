import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getConceptGuide, getAllConceptSlugs, getSectionForConcept } from '@/lib/system-design/concepts';
import { extractHeadings } from '@/lib/system-design/headings';
import TableOfContents from '@/components/ui/TableOfContents/TableOfContents';
import { PageHero } from '@/components/ui/PageHero/PageHero';
import { TDPageLayout } from '@/components/ui/TDPageLayout/TDPageLayout';
import MarkdownRenderer from '@/components/system-design/MarkdownRenderer/MarkdownRenderer';

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return getAllConceptSlugs().map((slug) => ({ slug }));
}

export default function ConceptPage({ params }: Props) {
  const guide = getConceptGuide(params.slug);
  if (!guide) notFound();

  const context = getSectionForConcept(params.slug);
  const section = context?.section;
  const phase = context?.phase;

  const strippedContent = guide.content.replace(/^#[^#].*\n+/, '').trimStart();
  const headings = extractHeadings(strippedContent);

  return (
    <TDPageLayout
      hero={
        <PageHero>
          <h1 className="text-5xl leading-tight text-[var(--ms-text-body)] font-display mb-0">
            {guide.title}
          </h1>
          {section && (
            <p className="text-lg italic leading-snug text-[var(--ms-primary)] mb-6">
              &ldquo;{section.mentalModelHook}&rdquo;
            </p>
          )}
          <div className="flex items-center gap-2">
            {phase && (
              <mark className="text-xs bg-transparent border border-[var(--ms-surface)] rounded text-[var(--ms-text-muted)]">
                {phase.emoji} {phase.label}
              </mark>
            )}
            {section && (
              <mark className="text-xs bg-transparent border border-[var(--ms-surface)] rounded text-[var(--ms-text-muted)]">
                {section.label}
              </mark>
            )}
            <mark className="text-xs bg-transparent border border-[var(--ms-surface)] rounded text-[var(--ms-text-muted)]">
              Concept
            </mark>
          </div>
        </PageHero>
      }
      aside={<TableOfContents headings={headings} title="Contents" />}
    >
      <section className="space-y-8 py-2">
        <MarkdownRenderer
          content={strippedContent}
          prompts={[guide.evaluatorPrompt]}
          phase={phase?.number ?? 1}
          storageKeyPrefix={`chat:concept:${params.slug}`}
        />

        <div className="flex items-center justify-between border-t border-t-[var(--ms-surface)] pt-8">
          {section?.fundamentalsSlug ? (
            <Link
              href={`/system-design/fundamentals/${section.fundamentalsSlug}`}
              className="text-sm text-[var(--ms-text-subtle)] transition-opacity hover:opacity-70"
            >
              ← {section.label} Fundamentals
            </Link>
          ) : (
            <Link
              href="/system-design/path"
              className="text-sm text-[var(--ms-text-subtle)] transition-opacity hover:opacity-70"
            >
              ← Back to Learning Path
            </Link>
          )}
        </div>
      </section>
    </TDPageLayout>
  );
}
