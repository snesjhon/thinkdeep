'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { AppIcon } from '@/components/dsa/AppIcon/AppIcon';
import { JOURNEY as DSA_JOURNEY } from '@/lib/dsa/journey';
import { PROBLEM_TITLES } from '@/lib/dsa/titles';
import { JourneyPanel } from '../JourneyPanel/JourneyPanel';
import type { JourneyPanelPhase } from '../JourneyPanel/JourneyPanel';

// ── DSA static lookups ────────────────────────────────────────────────────────

const DSA_FUNDAMENTALS_TO_SECTION: Record<string, string> = {};
const DSA_PROBLEM_TO_SECTION: Record<string, string> = {};
for (const phase of DSA_JOURNEY) {
  for (const section of phase.sections) {
    if (section.fundamentalsSlug)
      DSA_FUNDAMENTALS_TO_SECTION[section.fundamentalsSlug] = section.id;
    for (const p of section.firstPass)
      DSA_PROBLEM_TO_SECTION[p.id] = section.id;
    for (const p of section.reinforce)
      DSA_PROBLEM_TO_SECTION[p.id] = section.id;
  }
}

// ── Normalized phases ─────────────────────────────────────────────────────────

const DSA_PHASES: JourneyPanelPhase[] = DSA_JOURNEY.map((phase) => ({
  number: phase.number,
  label: phase.label,
  emoji: phase.emoji,
  sections: phase.sections.map((section, idx) => {
    const nextSection = phase.sections[idx + 1];
    return {
      id: section.id,
      label: section.label,
      fundamentalsSlug: section.fundamentalsSlug,
      items: section.firstPass.map((p) => ({
        key: p.id,
        label: PROBLEM_TITLES[p.id] ?? `Problem ${p.id}`,
        prefix: p.id,
      })),
      revisitItems: section.reinforce.map((p) => ({
        key: p.id,
        label: PROBLEM_TITLES[p.id] ?? `Problem ${p.id}`,
        prefix: p.id,
      })),
      revisitFromLabel: section.label,
      revisitPrerequisiteLabel:
        section.reinforcePrerequisiteLabel ?? nextSection?.label,
    };
  }),
}));

// ── Active state helpers ──────────────────────────────────────────────────────

function dsaActiveSection(path: string): string | null {
  const fund = path.match(/^\/dsa\/fundamentals\/([^/]+)/)?.[1];
  if (fund) return DSA_FUNDAMENTALS_TO_SECTION[fund] ?? null;
  const prob = path.match(/^\/dsa\/problems\/([^/]+)/)?.[1];
  if (prob) return DSA_PROBLEM_TO_SECTION[prob] ?? null;
  return null;
}

// ── SiteNav ───────────────────────────────────────────────────────────────────

interface SiteNavProps {
  availableProblemIds: string[];
  availableFundamentalsSlugs: string[];
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export function SiteNav({
  availableProblemIds: availableProblemIdsArr,
  availableFundamentalsSlugs: availableDsaFundamentalsArr,
  collapsed,
  onToggleCollapsed,
}: SiteNavProps) {
  const availableProblemIds = new Set(availableProblemIdsArr);
  const availableDsaFundamentals = new Set(availableDsaFundamentalsArr);

  const pathname = usePathname();
  const activeSectionId = dsaActiveSection(pathname);
  const isDsaPage = pathname.startsWith('/dsa');

  return (
    <nav className="sticky left-0 top-0 z-50 flex h-screen w-full flex-col border-r border-r-[var(--ms-surface)] bg-[var(--ms-bg-pane-secondary)]">
      <div
        className={`shrink-0 pb-[14px] pt-[18px] ${collapsed ? 'px-3' : 'px-4'}`}
      >
        <Link
          href="/"
          className={`no-underline flex items-center focus:outline-none ${collapsed ? 'justify-center' : 'gap-[10px]'}`}
        >
          <span className="text-[var(--ms-text-body)]">
            <AppIcon size={26} />
          </span>
          {!collapsed && (
            <span className="text-[1.05rem] font-normal tracking-[-0.01em] text-[var(--ms-text-body)] [font-family:var(--font-display)]">
              thinkdeep
            </span>
          )}
        </Link>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        {isDsaPage && (
          <>
            <div
              className={`${collapsed ? 'px-3 ' : 'pl-4 pr-2'} py-3`}
              style={{ boxShadow: 'inset 0 -1px 0 var(--ms-surface)' }}
            >
              <div
                className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between gap-2'}`}
              >
                {!collapsed && (
                  <Link
                    href="/dsa/path"
                    className="flex min-w-0 items-center gap-2 text-[0.775rem] font-normal text-[var(--ms-text-body)] no-underline transition-colors visited:text-[var(--ms-text-body)] hover:text-[var(--ms-primary)] focus:outline-none focus-visible:outline-none active:outline-none"
                  >
                    <ChevronLeft
                      aria-hidden="true"
                      className="h-3.5 w-3.5 shrink-0"
                    />
                    <span>Back to Path</span>
                  </Link>
                )}
                <button
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                  }}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onToggleCollapsed();
                  }}
                  aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  className="appearance-none shadow-none flex items-center justify-between rounded-md border-none bg-transparent font-semibold transition-[background,color] duration-150 outline-none ring-0 hover:bg-[var(--ms-primary-surface)] focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 p-2 text-[var(--ms-text-fainted)] mb-0"
                >
                  {collapsed ? (
                    <ChevronsRight className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronsLeft className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <JourneyPanel
                phases={DSA_PHASES}
                pathname={pathname}
                activeSectionId={activeSectionId}
                activeItemKey={
                  pathname.match(/^\/dsa\/problems\/([^/]+)/)?.[1] ?? null
                }
                activeFundamentalsSlug={
                  pathname.match(/^\/dsa\/fundamentals\/([^/]+)/)?.[1] ?? null
                }
                availableItemKeys={availableProblemIds}
                availableFundamentalsSlugs={availableDsaFundamentals}
                getItemHref={(key) => `/dsa/problems/${key}`}
                getFundamentalsHref={(slug) => `/dsa/fundamentals/${slug}`}
                compact={collapsed}
              />
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
