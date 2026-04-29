import Link from 'next/link';
import { JOURNEY, type JourneySection, type Phase } from '@/lib/dsa/journey';
import { getAllProblems } from '@/lib/dsa/content';
import { createClient } from '@/lib/supabase/server';
import {
  PhaseBannerContent,
  StepGuideCard,
  PlaceholderGuideCard,
  AdvSection,
} from '@/components/ui/PathComponents/PathComponents';
import { ProgressToggle } from '@/components/ui/ProgressToggle/ProgressToggle';
import { SectionProgress } from '@/components/ui/SectionProgress/SectionProgress';
import { PhaseTracker } from '@/components/ui/PhaseTracker/PhaseTracker';
import { pColor } from '@/components/ui/pathUtils';
import { PageHero } from '@/components/ui/PageHero/PageHero';
import pathStyles from '@/components/ui/PathComponents/PathComponents.module.css';

type PMap = Record<string, { title: string; hasMentalModel: boolean }>;

type SectionEntry = {
  section: JourneySection;
  phase: Phase;
  stepNum: number;
};

function buildCurriculum(): SectionEntry[] {
  const entries: SectionEntry[] = [];
  let stepNum = 0;

  JOURNEY.forEach((phase) => {
    phase.sections.forEach((section) => {
      stepNum++;
      entries.push({ section, phase, stepNum });
    });
  });

  return entries;
}

type PhaseGroup = { phase: Phase; entries: SectionEntry[] };

function buildPhaseGroups(): PhaseGroup[] {
  const curriculum = buildCurriculum();
  const groups: PhaseGroup[] = [];
  for (const entry of curriculum) {
    const last = groups[groups.length - 1];
    if (!last || last.phase.number !== entry.phase.number) {
      groups.push({ phase: entry.phase, entries: [entry] });
    } else {
      last.entries.push(entry);
    }
  }
  return groups;
}

export default async function PathPage() {
  const allProblems = getAllProblems();
  const problemMap: PMap = Object.fromEntries(
    allProblems.map((p) => [p.id, p]),
  );

  const totalProblems = allProblems.length;
  const totalSections = JOURNEY.reduce((acc, p) => acc + p.sections.length, 0);

  const phaseGroups = buildPhaseGroups();

  // Fetch progress
  const supabase = createClient();
  const { data: progressRows } = await supabase
    .from('progress')
    .select('item_type, item_id');

  const completedProblems = new Set(
    progressRows
      ?.filter((r: { item_type: string; item_id: string }) => r.item_type === 'problem')
      .map((r: { item_type: string; item_id: string }) => r.item_id) ?? [],
  );
  const completedSections = new Set(
    progressRows
      ?.filter((r: { item_type: string; item_id: string }) => r.item_type === 'section')
      .map((r: { item_type: string; item_id: string }) => r.item_id) ?? [],
  );

  return (
    <>
      <PageHero>
        <h1 className="text-5xl text-[var(--ms-text-body)] font-display">The Path</h1>
        <p className="text-sm text-[var(--ms-text-faint)] mb-0">
          {totalSections} mental models · {totalProblems} problems
        </p>
      </PageHero>
      <div>
        {phaseGroups.map(({ phase, entries }, groupIdx) => {
          const color = pColor(phase.number);
          void groupIdx;
          const chapterLabel = String(phase.number).padStart(2, '0');

          return (
            <div key={phase.number} id={`phase-zone-${phase.number}`} className="bg-[var(--ms-bg-pane-secondary)]">
              <div className="max-w-[1152px] mx-auto px-6">
                <PhaseBannerContent
                  phase={phase}
                  color={color}
                  chapterLabel={chapterLabel}
                />

                {entries.map((entry, entryIdx) => {
                  const { section, stepNum } = entry;
                  const accent = color;
                  const stepLabel = String(stepNum).padStart(2, '0');
                  const hasNewProblems = section.firstPass.length > 0;
                  const hasAdvProblems = section.reinforce.length > 0;
                  const hasAnyProblems = hasNewProblems || hasAdvProblems;
                  const isLast = entryIdx === entries.length - 1;

                  const firstPassItemIds = section.firstPass.map((p) => `dsa-${p.id}`);

                  return (
                    <div
                      key={section.id}
                      className={`grid grid-cols-2 items-start gap-7 ${
                        isLast ? 'pb-6' : 'pb-12'
                      }`}
                    >
                      {/* LEFT: Guide card + section progress */}
                      <div>
                        {section.fundamentalsSlugs?.length ? (
                          <StepGuideCard
                            guideLinks={section.fundamentalsSlugs.map((slug, idx) => ({
                              href: `/dsa/fundamentals/${slug}`,
                              label: section.fundamentalsLabels?.[idx] ?? 'Read the guide',
                            }))}
                            label={section.label}
                            hook={section.mentalModelHook}
                            stepNum={stepLabel}
                            color={accent}
                          />
                        ) : (
                          <PlaceholderGuideCard
                            label={section.label}
                            hook={section.mentalModelHook}
                            stepNum={stepLabel}
                          />
                        )}
                        <SectionProgress
                          sectionItemId={`dsa-section-${section.id}`}
                          problemItemIds={firstPassItemIds}
                          initialCompletedProblemIds={firstPassItemIds.filter((id) =>
                            completedProblems.has(id),
                          )}
                          initialSectionCompleted={completedSections.has(
                            `dsa-section-${section.id}`,
                          )}
                        />
                      </div>

                      {/* RIGHT: Practice + revisit */}
                      <div className="pt-1">
                        {!hasAnyProblems && (
                          <p className="font-display italic text-sm text-[var(--ms-text-faint)] m-0">
                            Problems coming soon.
                          </p>
                        )}

                        {hasNewProblems && (
                          <div className={hasAdvProblems ? 'mb-5' : ''}>
                            <p className="font-mono text-[0.6rem] font-bold tracking-[0.09em] uppercase mb-2 text-[var(--ms-text-faint)]">
                              Practice
                            </p>
                            {section.firstPass.map(({ id }) => {
                              const p = problemMap[id];
                              if (!p) return null;
                              const itemId = `dsa-${id}`;
                              return (
                                <div
                                  key={id}
                                  className="flex items-center gap-1 py-[5px]"
                                >
                                  <ProgressToggle
                                    itemType="problem"
                                    itemId={itemId}
                                    initialCompleted={completedProblems.has(itemId)}
                                  />
                                  <Link
                                    href={`/dsa/problems/${id}`}
                                    className={`${pathStyles.problemLink} flex items-baseline`}
                                  >
                                    <span className="shrink-0 min-w-[30px] font-mono text-[0.65rem] text-[var(--ms-text-faint)]">
                                      {id}
                                    </span>
                                    <span className={`${pathStyles.problemTitle} text-[0.875rem] leading-[1.3] text-[var(--ms-text-muted)]`}>
                                      {p.title}
                                    </span>
                                  </Link>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {hasAdvProblems && (
                          <AdvSection>
                            {section.reinforce.map(({ id }) => {
                              const p = problemMap[id];
                              if (!p) return null;
                              const itemId = `dsa-${id}`;
                              return (
                                <div
                                  key={`adv-${id}`}
                                  className="flex items-center gap-1 py-[5px]"
                                >
                                  <ProgressToggle
                                    itemType="problem"
                                    itemId={itemId}
                                    initialCompleted={completedProblems.has(itemId)}
                                  />
                                  <Link
                                    href={`/dsa/problems/${id}`}
                                    className={`${pathStyles.problemLink} flex items-baseline`}
                                  >
                                    <span className="shrink-0 min-w-[30px] font-mono text-[0.65rem] text-[var(--ms-text-faint)]">
                                      {id}
                                    </span>
                                    <span className={`${pathStyles.problemTitle} text-[0.875rem] leading-[1.3] text-[var(--ms-text-subtle)]`}>
                                      {p.title}
                                    </span>
                                  </Link>
                                </div>
                              );
                            })}
                          </AdvSection>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Footer strip */}
        <div className="max-w-[1152px] mx-auto px-6">
          <div className="flex items-center gap-4 pt-8 pb-16">
            <div className="flex-1 h-px bg-[var(--ms-surface)]" />
            <span className="font-display text-[0.8rem] italic shrink-0 text-[var(--ms-text-faint)]">
              More mental models coming
            </span>
            <div className="flex-1 h-px bg-[var(--ms-surface)]" />
          </div>
        </div>
      </div>

      <PhaseTracker phaseCount={phaseGroups.length} />
    </>
  );
}
