import { Circle, CircleCheck } from 'lucide-react';

interface ProgressMarkProps {
  completed: boolean;
  className?: string;
}

export function ProgressMark({
  completed,
  className = '',
}: ProgressMarkProps) {
  const Icon = completed ? CircleCheck : Circle;

  return (
    <Icon
      aria-hidden="true"
      className={`h-3.5 w-3.5 shrink-0 ${
        completed ? 'text-[var(--ms-primary)]' : 'text-[var(--ms-text-subtle)]'
      } ${className}`.trim()}
    />
  );
}
