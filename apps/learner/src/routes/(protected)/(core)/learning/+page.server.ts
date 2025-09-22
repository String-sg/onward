import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {
    collections: [
      {
        id: 1,
        title: 'Learn to use AI',
        type: 'AI',
        tags: [{ code: 'AI', label: 'Artificial Intelligence' }],
        numberofpodcasts: 8,
      },
      {
        id: 2,
        title: 'SEN peer support',
        type: 'SEN',
        tags: [{ code: 'SEN', label: 'Special Educational Needs' }],
        numberofpodcasts: 12,
      },
    ],
  };
};
