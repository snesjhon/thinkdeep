'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import {
  ChevronRight,
  Leaf,
  Target,
  BookOpen,
  Circle,
  CircleCheck,
  AlignJustify,
  Hash,
  ArrowLeftRight,
  AppWindow,
  Link2,
  Layers,
  RotateCcw,
  Search,
  GitBranch,
  GitFork,
  ChevronUp,
  Network,
  GitMerge,
  Share2,
  Activity,
  Undo2,
  Zap,
  LayoutGrid,
  TrendingUp,
  Clock,
  Type,
  Compass,
  Code2,
  type LucideIcon,
} from 'lucide-react';
import { pColor } from '../pathUtils';
import { ProgressMark } from '../ProgressMark/ProgressMark';

export interface JourneyPanelItem {
  key: string;
  label: string;
  /** Optional monospace prefix shown before the label (e.g. problem id) */
  prefix?: string;
}

export interface JourneyPanelSection {
  id: string;
  label: string;
  fundamentalsSlug?: string;
  items: JourneyPanelItem[];
  revisitItems?: JourneyPanelItem[];
}

export interface JourneyPanelPhase {
  number: number;
  label: string;
  emoji: string;
  sections: JourneyPanelSection[];
}

export interface JourneyPanelProps {
  phases: JourneyPanelPhase[];
  pathname: string;
  activeSectionId: string | null;
  activeItemKey: string | null;
  activeFundamentalsSlug: string | null;
  availableItemKeys: Set<string>;
  availableFundamentalsSlugs: Set<string>;
  getItemHref: (key: string) => string;
  getFundamentalsHref: (slug: string) => string;
}

function phaseIcon(label: string): LucideIcon {
  switch (label) {
    case 'Novice':
      return Leaf;
    case 'Studied':
      return BookOpen;
    case 'Expert':
      return Target;
    default:
      return BookOpen;
  }
}

const SECTION_ICONS: Record<string, LucideIcon> = {
  'arrays-strings': AlignJustify,
  'hash-maps': Hash,
  'two-pointers': ArrowLeftRight,
  'sliding-window': AppWindow,
  'linked-lists': Link2,
  'stack-queue': Layers,
  'recursion-backtracking-intro': RotateCcw,
  'binary-search': Search,
  'binary-trees': GitBranch,
  'binary-search-trees': GitFork,
  'heaps-priority-queues': ChevronUp,
  graphs: Network,
  'graph-traversal-dfs': GitMerge,
  'graph-traversal-bfs': Share2,
  'advanced-graphs': Activity,
  'backtracking-deep': Undo2,
  'dp-1d': Zap,
  'dp-2d': LayoutGrid,
  greedy: TrendingUp,
  intervals: Clock,
  tries: Type,
  'math-geometry': Compass,
  'bit-manipulation': Code2,
};

export function JourneyPanel({
  phases,
  pathname,
  activeSectionId,
  activeItemKey,
  activeFundamentalsSlug,
  availableItemKeys,
  availableFundamentalsSlugs,
  getItemHref,
  getFundamentalsHref,
}: JourneyPanelProps) {
  const fetcher = (url: string) => fetch(url).then((r) => r.json());

  // Problem progress
  const problemIds = Array.from(availableItemKeys).sort();
  const progressParams = new URLSearchParams({ itemType: 'problem' });
  problemIds.forEach((id) => progressParams.append('itemId', `dsa-${id}`));
  const progressKey = problemIds.length
    ? `/api/progress?${progressParams.toString()}`
    : null;
  const { data: progressData } = useSWR<{ completedIds: string[] }>(
    progressKey,
    fetcher,
  );
  const completedProblemIds = new Set(
    (progressData?.completedIds ?? [])
      .map((id) => id.match(/^dsa-(.+)$/)?.[1] ?? null)
      .filter((id): id is string => Boolean(id)),
  );

  // Fundamentals progress — single item per slug
  const fundSlugs = Array.from(availableFundamentalsSlugs).sort();
  const fundParams = new URLSearchParams({ itemType: 'fundamentals' });
  fundSlugs.forEach((slug) =>
    fundParams.append('itemId', `dsa-fundamentals-${slug}`),
  );
  const fundKey = fundSlugs.length
    ? `/api/progress?${fundParams.toString()}`
    : null;
  const { data: fundData } = useSWR<{ completedIds: string[] }>(
    fundKey,
    fetcher,
  );
  const completedFundIds = new Set(fundData?.completedIds ?? []);

  const isFundamentalsComplete = (slug: string) =>
    completedFundIds.has(`dsa-fundamentals-${slug}`);

  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    () => new Set(),
  );

  // useEffect(() => {
  //   if (!activeSectionId) return;
  //   setExpandedSections((prev) => {
  //     if (prev.has(activeSectionId)) return prev;
  //     const next = new Set(prev);
  //     next.add(activeSectionId);
  //     return next;
  //   });
  // }, [activeSectionId]);

  const activeItemRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    activeItemRef.current?.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth',
    });
  }, [pathname]);

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  return (
    <>
      {phases.map((phase) => {
        const color = pColor(phase.number);
        const PhaseIcon = phaseIcon(phase.label);

        return (
          <div
            key={phase.number}
            className="[--phase-accent:var(--ms-primary)]"
            style={{ '--phase-accent': color } as React.CSSProperties}
          >
            {/* Phase label */}
            <div className="flex items-center gap-1.5 px-4 pb-1 pt-4">
              <PhaseIcon
                aria-hidden="true"
                className="h-3.5 w-3.5 text-[var(--ms-success)]"
              />
              <span className="text-[0.66rem] font-bold uppercase tracking-[0.08em] text-[var(--ms-text-body)]">
                {phase.label}
              </span>
            </div>

            {/* Sections */}
            {phase.sections.map((section) => {
              const isCollapsed = collapsedSections.has(section.id);
              const isThisActive = activeSectionId === section.id;
              const availableItems = section.items.filter((i) =>
                availableItemKeys.has(i.key),
              );
              const availableRevisits = (section.revisitItems ?? []).filter(
                (i) => availableItemKeys.has(i.key),
              );
              const SectionIcon = SECTION_ICONS[section.id];

              return (
                <div key={section.id}>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className={`appearance-none shadow-none flex w-full items-center gap-2 justify-between rounded-md border-none bg-transparent px-4 py-3 text-left text-[0.775rem] leading-[1.4] font-semibold transition-[background,color] duration-150 outline-none ring-0 hover:bg-[var(--ms-primary-surface)] focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 ${
                      isThisActive
                        ? 'text-[var(--ms-text-body)]'
                        : 'text-[var(--ms-text-muted)]'
                    }`}
                  >
                    {SectionIcon && (
                      <SectionIcon
                        aria-hidden="true"
                        className="h-3.5 w-3.5 shrink-0 text-[var(--ms-text-muted)]"
                      />
                    )}
                    <span className="min-w-0 flex-1 pr-1.5">
                      {section.label}
                    </span>
                    <ChevronRight
                      aria-hidden="true"
                      className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                        isCollapsed
                          ? 'text-[var(--ms-text-faint)]'
                          : 'rotate-90 text-[var(--ms-text-muted)]'
                      }`}
                    />
                  </button>

                  {!isCollapsed && (
                    <div className="mb-1 ml-4 border-l border-l-[var(--ms-surface)]">
                      {/* Fundamentals guide link */}
                      {section.fundamentalsSlug &&
                        availableFundamentalsSlugs.has(
                          section.fundamentalsSlug,
                        ) &&
                        (() => {
                          const isFundActive =
                            activeFundamentalsSlug === section.fundamentalsSlug;
                          const fundComplete = isFundamentalsComplete(
                            section.fundamentalsSlug!,
                          );
                          return (
                            <Link
                              ref={isFundActive ? activeItemRef : null}
                              href={getFundamentalsHref(
                                section.fundamentalsSlug!,
                              )}
                              className={`flex items-center gap-2 rounded-md px-[10px] py-[6px] text-[0.75rem] no-underline transition-[color,background] duration-150 focus:outline-none hover:bg-[var(--ms-primary-surface)] ${
                                isFundActive
                                  ? 'font-semibold text-[var(--ms-primary)]'
                                  : 'font-normal text-[var(--ms-text-subtle)]'
                              }`}
                            >
                              <ProgressMark
                                completed={fundComplete}
                                fundamentals
                              />
                              <span>Fundamentals</span>
                            </Link>
                          );
                        })()}

                      {/* Items */}
                      {availableItems.map((item) => {
                        const isActive = activeItemKey === item.key;
                        const isCompleted = completedProblemIds.has(item.key);
                        return (
                          <Link
                            key={item.key}
                            ref={isActive ? activeItemRef : null}
                            href={getItemHref(item.key)}
                            className={`flex items-center gap-2 rounded-md px-[10px] py-[6px] text-[0.75rem] no-underline transition-[color,background] duration-150 focus:outline-none hover:bg-[var(--ms-primary-surface)] ${
                              isActive
                                ? 'font-semibold text-[var(--ms-primary)]'
                                : 'font-normal text-[var(--ms-text-subtle)]'
                            }`}
                          >
                            <ProgressMark completed={isCompleted} />
                            <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                              {item.label}
                            </span>
                          </Link>
                        );
                      })}

                      {/* Revisit items */}
                      {availableRevisits.length > 0 && (
                        <>
                          <div className="px-[10px] pb-[3px] pt-2 text-[0.58rem] font-bold uppercase tracking-[0.08em] text-[var(--ms-text-faint)] [font-family:var(--font-body)]">
                            Also revisit
                          </div>
                          {availableRevisits.map((item) => {
                            const isActive = activeItemKey === item.key;
                            const isCompleted = completedProblemIds.has(
                              item.key,
                            );
                            return (
                              <Link
                                key={item.key}
                                ref={isActive ? activeItemRef : null}
                                href={getItemHref(item.key)}
                                className={`flex items-center gap-2 rounded-md px-[10px] py-[6px] text-[0.75rem] no-underline transition-[color,background] duration-150 focus:outline-none hover:bg-[var(--ms-primary-surface)] ${
                                  isActive
                                    ? 'font-semibold text-[var(--ms-primary)]'
                                    : 'font-normal text-[var(--ms-text-subtle)]'
                                }`}
                              >
                                <ProgressMark completed={isCompleted} />
                                <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                                  {item.label}
                                </span>
                              </Link>
                            );
                          })}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </>
  );
}
