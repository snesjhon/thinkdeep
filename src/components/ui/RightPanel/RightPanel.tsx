'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { ThemeSwitcher } from '../ThemeSwitcher/ThemeSwitcher';
import { UserAvatarDropdown } from '../UserAvatarDropdown/UserAvatarDropdown';
import {
  RIGHT_PANEL_COLLAPSED_STORAGE_KEY,
  readStoredBoolean,
  writeStoredBoolean,
} from '@/lib/sidebarState';

interface RightPanelProps {
  progress?: React.ReactNode;
  toc: React.ReactNode;
}

export function RightPanel({ progress, toc }: RightPanelProps) {
  const hasLoadedCollapsedState = useRef(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(readStoredBoolean(RIGHT_PANEL_COLLAPSED_STORAGE_KEY, false));
    hasLoadedCollapsedState.current = true;
  }, []);

  useEffect(() => {
    if (!hasLoadedCollapsedState.current) return;

    writeStoredBoolean(RIGHT_PANEL_COLLAPSED_STORAGE_KEY, collapsed);
  }, [collapsed]);

  return (
    <aside
      className={`sticky top-0 flex h-screen flex-col border-l border-l-[var(--ms-surface)] bg-[var(--ms-bg-pane-secondary)] transition-[width] duration-200 ease-out ${
        collapsed ? 'w-[60px]' : 'w-[260px]'
      }`}
    >
      <div
        className={`${collapsed ? 'px-2' : 'px-4'} shrink-0 py-2`}
        style={{ boxShadow: 'inset 0 -1px 0 var(--ms-surface)' }}
      >
        <div
          className={`flex items-center ${collapsed ? 'justify-center' : 'justify-center'}`}
        >
          <button
            type="button"
            onMouseDown={(event) => {
              event.preventDefault();
            }}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setCollapsed((prev) => !prev);
            }}
            aria-label={collapsed ? 'Expand right panel' : 'Collapse right panel'}
            title={collapsed ? 'Expand right panel' : 'Collapse right panel'}
            className="appearance-none shadow-none mb-0 flex h-7 w-7 items-center justify-center rounded-md border-none bg-transparent p-0 text-[var(--ms-text-fainted)] transition-[background,color] duration-150 outline-none ring-0 hover:bg-[var(--ms-primary-surface)] focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
          >
            {collapsed ? (
              <ChevronsLeft className="h-3.5 w-3.5" />
            ) : (
              <ChevronsRight className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {!collapsed ? (
        <>
          <div className="min-h-0 overflow-y-auto p-4">{toc}</div>
          <div className="flex-1 border-t border-t-[var(--ms-surface)] bg-[var(--ms-bg-pane-secondary)] p-4">
            {progress ? progress : null}
          </div>
        </>
      ) : (
        <div className="flex-1" />
      )}

      <div className="shrink-0 border-t border-t-[var(--ms-surface)] bg-[var(--ms-bg-pane-secondary)]">
        <div
          className={`flex items-center ${collapsed ? 'flex-col justify-center gap-3 px-2 py-3' : 'justify-between p-4'}`}
        >
          <UserAvatarDropdown compact />
          <ThemeSwitcher compact />
        </div>
      </div>
    </aside>
  );
}
