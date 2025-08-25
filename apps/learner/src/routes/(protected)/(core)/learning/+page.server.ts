import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {
    collections: [
      {
        id: 1,
        tag: 'Special Educational Needs',
        title: 'SEN peer support',
        numberofpodcasts: 12,
        numberofnotes: 2,
        variant: 'purple',
        to: '/collection/1',
      },
      {
        id: 2,
        tag: 'Artificial Intelligence',
        title: 'Learn to use AI',
        numberofpodcasts: 8,
        numberofnotes: 3,
        variant: 'amber',
        to: '/collection/2',
      },
      {
        id: 3,
        tag: 'Teacher mental health literacy',
        title: 'Understanding Mental Health',
        numberofpodcasts: 10,
        numberofnotes: 1,
        variant: 'teal',
        to: '/collection/3',
      },
    ],
  };
};
