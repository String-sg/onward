import type { BadgeProps } from '$lib/components/Badge/index.js';

const TAG_CODE_TO_BADGE_VARIANT: Record<string, BadgeProps['variant']> = {
  AI: 'amber',
  BOB: 'indigo',
  CAREER: 'green',
  INNOV: 'sky',
  NEWS: 'orange',
  PROD: 'rose',
  STU_DEV: 'purple',
  STU_WELL: 'green',
  WELLBEING: 'teal',
  PDF: 'rose',
  LINK: 'blue',
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
