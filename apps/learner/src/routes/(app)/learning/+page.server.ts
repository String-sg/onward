import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {
    learningJourneys: [
      {
        id: 1,
        tag: 'Special Educational Needs',
        title: 'SEN peer support',
        numberofpodcasts: 12,
        numberofnotes: 2,
        variant: 'purple',
        to: '/learning/collection/1',
      },
      {
        id: 2,
        tag: 'Artificial Intelligence',
        title: 'Learn to use AI',
        numberofpodcasts: 8,
        numberofnotes: 3,
        variant: 'amber',
        to: '/learning/collection/2',
      },
      {
        id: 3,
        tag: 'Supporting Student socio-emotional learning',
        title: 'Strategies: Basic counselling',
        numberofpodcasts: 10,
        numberofnotes: 1,
        variant: 'teal',
        to: '/learning/collection/3',
      },
    ],
  };
};
