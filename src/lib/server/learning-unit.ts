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
