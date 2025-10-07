import type { BadgeProps } from '$lib/components/Badge/index.js';

/**
 * Get the variant of the badge based on the given tag code.
 *
 * @param code - The code of the tag.
 * @returns The variant of the badge.
 *
 * @example
 * ```typescript
 * const variant = tagCodeToBadgeVariant('SEN');
 * ```
 */
export function tagCodeToBadgeVariant(code: string): BadgeProps['variant'] {
  switch (code) {
    case 'SEN':
      return 'purple';
    case 'AI':
      return 'amber';
    default:
      return 'slate';
  }
}
