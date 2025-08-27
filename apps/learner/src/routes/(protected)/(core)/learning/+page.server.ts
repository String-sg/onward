import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {
    collections: [
      {
        id: 1,
        tag: 'Artificial Intelligence',
        title: 'Learn to use AI',
        numberofpodcasts: 8,
        numberofnotes: 3,
        to: '/collection/1',
        type: 'ai',
      },
      {
        id: 2,
        tag: 'Special Educational Needs',
        title: 'SEN peer support',
        numberofpodcasts: 12,
        numberofnotes: 2,
        to: '/collection/2',
        type: 'sen',
      },
      {
        id: 3,
        tag: 'Teacher mental health literacy',
        title: 'Understanding Mental Health',
        numberofpodcasts: 10,
        numberofnotes: 1,
        to: '/collection/3',
        type: 'mentalHealth',
      },
    ],
  };
};
