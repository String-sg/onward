import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {
    name: 'John Doe',
    email: 'john.doe@example.com',
    learningUnitsConsumedByMonth: '8',
    learningUnitsConsumedByWeek: '6',
    learningUnitsCompletedByMonth: '4',
    learningUnitsCompletedByWeek: '2',
  };
};
