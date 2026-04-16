'use client';

import Link from 'next/link';
import { useOptionalProgress } from '@/components/ui/ProgressProvider/ProgressProvider';

interface AdvancedPrerequisitePanelProps {
  label: string;
  fundamentalsSlug: string;
}

export default function AdvancedPrerequisitePanel({
  label,
  fundamentalsSlug,
}: AdvancedPrerequisitePanelProps) {
  const progress = useOptionalProgress();
  const itemId = `dsa-fundamentals-${fundamentalsSlug}`;
  const completed = progress?.isCompleted('fundamentals', itemId) ?? false;
  const isLoading = progress?.isLoading('fundamentals') ?? false;

  return (
    <div className="mb-5 rounded-xl border border-[var(--ms-surface)] bg-[var(--ms-bg-pane-secondary)] p-4">
      <p className="mb-1 text-xs font-semibold text-[var(--ms-text-body)]">
        Prerequisite
      </p>
      <p className="m-0 text-xs leading-6 text-[var(--ms-text-subtle)]">
        Complete{' '}
        <Link
          href={`/dsa/fundamentals/${fundamentalsSlug}`}
          className="font-medium text-[var(--ms-primary)] no-underline hover:underline"
        >
          {label} Fundamentals
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
