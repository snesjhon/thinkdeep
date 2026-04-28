'use client';

import { useEffect, useRef, useState } from 'react';
import { Command } from 'cmdk';
import { ChevronLeft, Search } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import type { SearchEntry } from '@/lib/search';
import {
  applyThemeFlavor,
  THEME_FLAVORS,
  THEME_LABELS,
} from '@/lib/theme';

interface GlobalSearchProps {
  entries: SearchEntry[];
}

type SearchView = 'root' | 'dsa' | 'system-design' | 'theme';

export function GlobalSearch({
  entries,
}: GlobalSearchProps) {
  const pathname = usePathname();
  const router = useRouter();
  const listRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [view, setView] = useState<SearchView>('root');
  const [shortcutLabel, setShortcutLabel] = useState('Ctrl K');
  const dsaEntries = entries.filter((entry) => entry.href.startsWith('/dsa'));
  const systemDesignEntries = entries.filter((entry) =>
    entry.href.startsWith('/system-design'),
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (navigator.platform.includes('Mac')) {
      setShortcutLabel('⌘K');
    }
  }, []);

  useEffect(() => {
    setOpen(false);
    setQuery('');
    setView('root');
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (open) return;
    setQuery('');
    setView('root');
  }, [open]);

  useEffect(() => {
    if (!open) return;

    requestAnimationFrame(() => {
      if (listRef.current) {
        listRef.current.scrollTop = 0;
      }
    });
  }, [open, query]);

  const placeholderByView: Record<SearchView, string> = {
    root: 'Search commands...',
    dsa: 'Search DSA pages...',
    'system-design': 'Search system design pages...',
    theme: 'Search theme options...',
  };

  const headingByView: Record<Exclude<SearchView, 'root'>, string> = {
    dsa: 'search dsa',
    'system-design': 'search system-design',
    theme: 'change theme',
  };

  const activeEntries =
    view === 'dsa'
      ? dsaEntries
      : view === 'system-design'
        ? systemDesignEntries
        : [];

  const goToRoot = () => {
    setView('root');
    setQuery('');
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[120] bg-[color-mix(in_srgb,var(--ms-bg-pane)_18%,transparent)] backdrop-blur-[6px]"
          onClick={() => setOpen(false)}
        >
          <div className="mx-auto mt-[10vh] w-[min(720px,calc(100vw-32px))]">
            <Command
              loop
              className="overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--ms-surface)_80%,transparent)] bg-[color-mix(in_srgb,var(--ms-bg-pane-secondary)_82%,transparent)] shadow-[0_20px_60px_rgba(0,0,0,0.12)] backdrop-blur-xl"
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.preventDefault();
                  if (view === 'root') {
                    setOpen(false);
                    return;
                  }

                  goToRoot();
                }

                if (
                  event.key === 'Backspace' &&
                  query.length === 0 &&
                  view !== 'root'
                ) {
                  event.preventDefault();
                  goToRoot();
                }
              }}
            >
              <div
                className="flex items-center gap-3 border-b border-[var(--ms-surface)] px-4"
                onClick={(event) => event.stopPropagation()}
              >
                {view !== 'root' && (
                  <button
                    type="button"
                    onClick={goToRoot}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ms-text-faint)] transition-colors hover:bg-[var(--ms-primary-surface)] hover:text-[var(--ms-text-body)]"
                    aria-label="Back to top-level commands"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                )}
                <Search className="h-4 w-4 shrink-0 text-[var(--ms-text-faint)]" />
                <Command.Input
                  autoFocus
                  value={query}
                  onValueChange={setQuery}
                  placeholder={placeholderByView[view]}
                  className="h-14 w-full border-0 bg-transparent text-sm text-[var(--ms-text-body)] outline-none placeholder:text-[var(--ms-text-faint)]"
                />
                <span className="shrink-0 text-[11px] font-[var(--font-mono)] text-[var(--ms-text-faint)]">
                  {shortcutLabel}
                </span>
              </div>

              <Command.List
                ref={listRef}
                className="max-h-[60vh] overflow-y-auto p-2"
                onClick={(event) => event.stopPropagation()}
              >
                {view === 'root' ? (
                  <>
                    <Command.Empty className="px-3 py-10 text-center text-sm text-[var(--ms-text-faint)]">
                      No commands matched.
                    </Command.Empty>
                    <Command.Item
                      value="search dsa"
                      keywords={['dsa', 'data structures', 'algorithms']}
                      onSelect={() => {
                        setView('dsa');
                        setQuery('');
                      }}
                      className="flex cursor-pointer flex-col gap-1 rounded-xl px-3 py-3 text-left outline-none data-[selected=true]:bg-[var(--ms-primary-surface)]"
                    >
                      <span className="text-sm font-medium text-[var(--ms-text-body)]">
                        search dsa
                      </span>
                      <span className="text-xs leading-5 text-[var(--ms-text-muted)]">
                        Browse and filter DSA pages only.
                      </span>
                    </Command.Item>
                    <Command.Item
                      value="search system-design"
                      keywords={['system design', 'distributed systems', 'architecture']}
                      onSelect={() => {
                        setView('system-design');
                        setQuery('');
                      }}
                      className="flex cursor-pointer flex-col gap-1 rounded-xl px-3 py-3 text-left outline-none data-[selected=true]:bg-[var(--ms-primary-surface)]"
                    >
                      <span className="text-sm font-medium text-[var(--ms-text-body)]">
                        search system-design
                      </span>
                      <span className="text-xs leading-5 text-[var(--ms-text-muted)]">
                        Browse and filter system design pages only.
                      </span>
                    </Command.Item>
                    <Command.Item
                      value="change theme"
                      keywords={['theme', 'appearance', 'color']}
                      onSelect={() => {
                        setView('theme');
                        setQuery('');
                      }}
                      className="flex cursor-pointer flex-col gap-1 rounded-xl px-3 py-3 text-left outline-none data-[selected=true]:bg-[var(--ms-primary-surface)]"
                    >
                      <span className="text-sm font-medium text-[var(--ms-text-body)]">
                        change theme
                      </span>
                      <span className="text-xs leading-5 text-[var(--ms-text-muted)]">
                        Pick a theme directly from the command menu.
                      </span>
                    </Command.Item>
                    <Command.Item
                      value="setting page"
                      keywords={['settings', 'preferences', 'account']}
                      onSelect={() => {
                        router.push('/settings');
                        setOpen(false);
                      }}
                      className="flex cursor-pointer flex-col gap-1 rounded-xl px-3 py-3 text-left outline-none data-[selected=true]:bg-[var(--ms-primary-surface)]"
                    >
                      <span className="text-sm font-medium text-[var(--ms-text-body)]">
                        setting page
                      </span>
                      <span className="text-xs leading-5 text-[var(--ms-text-muted)]">
                        Open the main settings page.
                      </span>
                    </Command.Item>
                  </>
                ) : view === 'theme' ? (
                  <>
                    <div className="px-3 pb-2 pt-1 text-[11px] font-[var(--font-mono)] uppercase tracking-[0.12em] text-[var(--ms-text-faint)]">
                      {headingByView[view]}
                    </div>
                    <Command.Empty className="px-3 py-10 text-center text-sm text-[var(--ms-text-faint)]">
                      No theme options matched.
                    </Command.Empty>
                    {THEME_FLAVORS.map((flavor) => (
                      <Command.Item
                        key={flavor}
                        value={`${THEME_LABELS[flavor]} theme`}
                        keywords={[flavor, THEME_LABELS[flavor], 'theme']}
                        onSelect={() => {
                          applyThemeFlavor(flavor);
                          setOpen(false);
                        }}
                        className="flex cursor-pointer flex-col gap-1 rounded-xl px-3 py-3 text-left outline-none data-[selected=true]:bg-[var(--ms-primary-surface)]"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm font-medium text-[var(--ms-text-body)]">
                            {THEME_LABELS[flavor]}
                          </span>
                          <span className="shrink-0 rounded-full border border-[var(--ms-surface)] px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-[var(--ms-text-faint)]">
                            Theme
                          </span>
                        </div>
                        <p className="text-xs leading-5 text-[var(--ms-text-muted)]">
                          Press enter to apply this theme.
                        </p>
                      </Command.Item>
                    ))}
                  </>
                ) : (
                  <>
                    <div className="px-3 pb-2 pt-1 text-[11px] font-[var(--font-mono)] uppercase tracking-[0.12em] text-[var(--ms-text-faint)]">
                      {headingByView[view]}
                    </div>
                    <Command.Empty className="px-3 py-10 text-center text-sm text-[var(--ms-text-faint)]">
                      No pages matched in this section.
                    </Command.Empty>

                    {activeEntries.map((entry) => (
                      <Command.Item
                        key={entry.id}
                        value={`${entry.title} ${entry.category}`}
                        keywords={entry.keywords}
                        onSelect={() => {
                          router.push(entry.href);
                          setOpen(false);
                        }}
                        className="flex cursor-pointer flex-col gap-1 rounded-xl px-3 py-3 text-left outline-none data-[selected=true]:bg-[var(--ms-primary-surface)]"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm font-medium text-[var(--ms-text-body)]">
                            {entry.title}
                          </span>
                          <span className="shrink-0 rounded-full border border-[var(--ms-surface)] px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-[var(--ms-text-faint)]">
                            {entry.category}
                          </span>
                        </div>
                        {(entry.section || entry.description) && (
                          <p className="text-xs leading-5 text-[var(--ms-text-muted)]">
                            {entry.section ? `${entry.section} · ` : ''}
                            {entry.description}
                          </p>
                        )}
                        <span className="text-[11px] font-[var(--font-mono)] text-[var(--ms-text-faint)]">
                          {entry.href}
                        </span>
                      </Command.Item>
                    ))}
                  </>
                )}
              </Command.List>
            </Command>
          </div>
        </div>
      )}
    </>
  );
}
