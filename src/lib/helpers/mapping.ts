import type { BadgeProps } from '$lib/components/Badge/index.js';

const TAG_CODE_TO_BADGE_VARIANT: Record<string, BadgeProps['variant']> = {
  AI: 'cyan',
  BOB: 'blue',
  CAREER: 'violet',
  INNOV: 'pink',
  NEWS: 'orange',
  PROD: 'emerald',
  STU_DEV: 'green',
  STU_WELL: 'sky',
  WELLBEING: 'teal',
  PDF: 'slate',
  LINK: 'slate',
};

/**
 * Get the variant of the badge based on the given tag code.
 *
 * @param code - The code of the tag.
 * @returns The variant of the badge.
 *
 * @example
 * ```typescript
 * const variant = tagCodeToBadgeVariant('BOB');
 * ```
 */
export function tagCodeToBadgeVariant(code: string): BadgeProps['variant'] {
  return TAG_CODE_TO_BADGE_VARIANT[code.toUpperCase()] || 'slate';
}
