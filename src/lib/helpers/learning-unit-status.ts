/**
 * Determines the status of a required Learning Unit.
 *
 * @param learningUnit - The learning unit object and its properties for status calculation.
 *
 * @returns The status of the learning unit, which can be 'COMPLETED', 'OVERDUE', 'REQUIRED', or null.
 *
 * @example
 * ```typescript
 * import { getStatus } from '$lib/helpers/index.js';
 *
 * const status = getStatus(learningUnit);
 * ```
 */
export function getStatus(learningUnit: {
  isRequired: boolean;
  dueDate: Date | null;
  learningJourney: {
    isCompleted: boolean;
  };
}): 'COMPLETED' | 'OVERDUE' | 'REQUIRED' | null {
  const now = new Date().setHours(0, 0, 0, 0);

  if (learningUnit.learningJourney && learningUnit.learningJourney.isCompleted) {
    return 'COMPLETED';
  }

  if (learningUnit.isRequired === false) {
    return null;
  }

  if (learningUnit.dueDate && learningUnit.dueDate.setHours(0, 0, 0, 0) < now) {
    return 'OVERDUE';
  }

  return 'REQUIRED';
}
