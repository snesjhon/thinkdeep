export const PHASE_COLORS = [
  'var(--purple)',
  'var(--blue)',
  'var(--green)',
  'var(--orange)',
  'var(--cyan)',
];

export const pColor = (n: number) =>
  PHASE_COLORS[(n - 1) % PHASE_COLORS.length];
