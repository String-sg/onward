import type { BadgeProps } from '$lib/components/Badge/index.js';

/**
 * Get the variant of the badge based on the given tag code.
 *
 * @param code - The code of the tag.
 * @returns The variant of the badge.
 *
 * @example
 * ```typescript
 * const variant = tagCodeToBadgeVariant('SPECIAL_EDUCATIONAL_NEEDS');
 * ```
 */
export function tagCodeToBadgeVariant(code: string): BadgeProps['variant'] {
  switch (code) {
    case 'SPECIAL_EDUCATIONAL_NEEDS':
      return 'purple';
    case 'LEARN_ABOUT_AI':
      return 'rose';
    case 'LEARN_TO_USE_AI':
      return 'amber';
    case 'INNOVATION':
      return 'sky';
    case 'LEARN_WITH_BOB':
      return 'indigo';
    case 'STUDENT_WELLBEING':
      return 'green';
    case 'STAFF_WELLBEING':
      return 'teal';
    case 'NEWS':
      return 'orange';
    case 'PDF':
      return 'rose';
    case 'LINK':
      return 'blue';
    default:
      return 'slate';
  }
}
