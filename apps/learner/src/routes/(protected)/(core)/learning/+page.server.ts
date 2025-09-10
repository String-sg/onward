import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {
    collections: [
      {
        id: 1,
        tag: 'Artificial Intelligence',
        title: 'Learn to use AI',
        numberofpodcasts: 8,
        to: '/usercollection/1',
        type: 'AI',
      },
      {
        id: 2,
        tag: 'Special Educational Needs',
        title: 'SEN peer support',
        numberofpodcasts: 12,
        to: '/usercollection/2',
        type: 'SEN',
      },
      {
        id: 3,
        tag: 'Teacher mental health literacy',
        title: 'Understanding Mental Health',
        numberofpodcasts: 10,
        to: '/usercollection/3',
        type: 'MENTAL_HEALTH',
      },
    ],
  };
};
