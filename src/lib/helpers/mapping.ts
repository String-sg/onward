import type { BadgeProps } from '$lib/components/Badge/index.js';

const BADGE_TYPE_INFO: Record<string, { variant: BadgeProps['variant']; label: string }> = {
  BOB: { variant: 'blue', label: 'Learn with BOB' },
  AI: { variant: 'pink', label: 'Artificial Intelligence' },
  NEWS: { variant: 'cyan', label: 'In the news' },
  PROD: { variant: 'orange', label: 'Productivity' },
  CAREER: { variant: 'violet', label: 'Career growth' },
  INNOV: { variant: 'pink', label: 'Innovation' },
  WELLBEING: { variant: 'emerald', label: 'Wellbeing' },
  STU_WELL: { variant: 'green', label: 'Student wellbeing' },
  STU_DEV: { variant: 'green', label: 'Student development' },
  INFRA: { variant: 'blue', label: 'Infrastructure' },
  EDU_TOOLS: { variant: 'orange', label: 'Educator tools' },
  EDU_VOICES: { variant: 'cyan', label: 'Educator voices' },
  EMP_ENGAGEMENT: { variant: 'blue', label: 'Employee engagement' },
  PDF: { variant: 'slate', label: 'PDF' },
  LINK: { variant: 'slate', label: 'Link' },
  REQUIRED: { variant: 'slate-light', label: 'Required' },
  OVERDUE: { variant: 'slate-light', label: 'Overdue' },
  COMPLETED: { variant: 'slate-light', label: 'Completed' },
};

/**
 * Get the badge variant and label for a collection type.
 *
 * @param badgeType - The collection type code.
 * @returns An object containing the badge variant and display label.
 *
 * @example
 * ```typescript
 * const { variant, label } = getCollectionBadgeInfo('BOB');
 * // Returns: { variant: 'blue', label: 'Learn with BOB' }
 * ```
 */
export function getBadgeInfo(badgeType: string): {
  variant: BadgeProps['variant'];
  label: string;
} {
  return (
    BADGE_TYPE_INFO[badgeType.toUpperCase()] || {
      variant: 'slate',
      label: badgeType,
    }
  );
}
