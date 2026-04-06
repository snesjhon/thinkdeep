import React from 'react';
import { ThemeSwitcher } from '../ThemeSwitcher/ThemeSwitcher';
import { UserAvatarDropdown } from '../UserAvatarDropdown/UserAvatarDropdown';

interface RightPanelProps {
  progress?: React.ReactNode;
  toc: React.ReactNode;
}

export function RightPanel({ progress, toc }: RightPanelProps) {
  return (
    <aside className="sticky top-0 flex h-screen flex-col border-l border-l-[var(--ms-surface)] bg-[var(--ms-bg-pane-secondary)]">
      <div className="min-h-0 flex-1 overflow-y-auto p-4">{toc}</div>
      <div className="shrink-0 border-t border-t-[var(--ms-surface)] bg-[var(--ms-bg-pane-secondary)]">
        {progress ? (
          <div className="border-b border-b-[var(--ms-surface)] p-4">
            {progress}
          </div>
        ) : null}
        <div className="relative z-20 p-4">
          <div className="flex items-center justify-between">
            <UserAvatarDropdown compact />
            <ThemeSwitcher compact />
          </div>
        </div>
      </div>
    </aside>
  );
}
