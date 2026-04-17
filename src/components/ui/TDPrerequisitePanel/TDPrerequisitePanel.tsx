'use client';

import Link from 'next/link';
import { useOptionalProgress } from '@/components/ui/ProgressProvider/ProgressProvider';
import type { ItemType } from '@/lib/progress/actions';

interface TDPrerequisitePanelProps {
  label: string;
  href: string;
  itemType: ItemType;
  itemId: string;
  itemLabel?: string;
}

export default function TDPrerequisitePanel({
  label,
  href,
  itemType,
  itemId,
  itemLabel = 'Fundamentals',
}: TDPrerequisitePanelProps) {
  const progress = useOptionalProgress();
  const completed = progress?.isCompleted(itemType, itemId) ?? false;
  const isLoading = progress?.isLoading(itemType) ?? false;

  return (
    <div className="mb-5 rounded-xl border border-[var(--ms-surface)] bg-[var(--ms-bg-pane-secondary)] p-4">
      <p className="mb-1 text-xs font-semibold text-[var(--ms-text-body)]">
        Prerequisite
      </p>
      <p className="m-0 text-xs leading-6 text-[var(--ms-text-subtle)]">
        Complete{' '}
        <Link
          href={href}
          className="font-medium text-[var(--ms-primary)] no-underline hover:underline"
        >
          {label} {itemLabel}
        </Link>{' '}
        first.
      </p>
      <p className="mb-0 mt-2 text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--ms-text-faint)]">
        Status:{' '}
        {isLoading
          ? 'loading'
          : completed
            ? 'completed'
            : 'not completed'}
      </p>
    </div>
  );
}
