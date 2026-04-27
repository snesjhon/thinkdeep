'use client';

import { useEffect, useRef, useState } from 'react';
import { Command } from 'cmdk';
import { Search } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import type { SearchEntry } from '@/lib/search';

interface GlobalSearchProps {
  entries: SearchEntry[];
}

export function GlobalSearch({
  entries,
}: GlobalSearchProps) {
  const pathname = usePathname();
  const router = useRouter();
  const listRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [shortcutLabel, setShortcutLabel] = useState('Ctrl K');
  const trimmedQuery = query.trim();
  const shouldShowResults = trimmedQuery.length > 0;

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
  }, [open]);

  useEffect(() => {
    if (!open) return;

    requestAnimationFrame(() => {
      if (listRef.current) {
        listRef.current.scrollTop = 0;
      }
    });
  }, [open, query]);

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
                  setOpen(false);
                }
              }}
            >
              <div
                className="flex items-center gap-3 border-b border-[var(--ms-surface)] px-4"
                onClick={(event) => event.stopPropagation()}
              >
                <Search className="h-4 w-4 shrink-0 text-[var(--ms-text-faint)]" />
                <Command.Input
                  autoFocus
                  value={query}
                  onValueChange={setQuery}
                  placeholder="Search every page..."
                  className="h-14 w-full border-0 bg-transparent text-sm text-[var(--ms-text-body)] outline-none placeholder:text-[var(--ms-text-faint)]"
                />
              </div>

              <Command.List
                ref={listRef}
                className="max-h-[60vh] overflow-y-auto p-2"
                onClick={(event) => event.stopPropagation()}
              >
                {!shouldShowResults ? (
                  <div className="px-3 py-10 text-center text-sm text-[var(--ms-text-faint)]">
                    Start typing to search pages.
                  </div>
                ) : (
                  <>
                    <Command.Empty className="px-3 py-10 text-center text-sm text-[var(--ms-text-faint)]">
                      No pages matched.
                    </Command.Empty>

                    {entries.map((entry) => (
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
