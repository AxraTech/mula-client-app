/** App-wide font size bump (+1px). Use fs() for new code. */
export const FONT_SIZE_OFFSET = 1;

export function fs(size: number): number {
  return size + FONT_SIZE_OFFSET;
}

export function lh(lineHeight: number): number {
  return lineHeight + FONT_SIZE_OFFSET;
}

export const typography = {
  xs: fs(8),
  sm: fs(10),
  md: fs(12),
  base: fs(14),
  lg: fs(16),
  xl: fs(18),
  "2xl": fs(20),
  "3xl": fs(24),
  "4xl": fs(28),
} as const;
