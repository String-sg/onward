import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {
    learningUnits: [
      {
        id: 1,

        to: '/content/1',
        tags: [
          { variant: 'purple', content: 'Special Educational Needs' },
          { variant: 'slate', content: 'Podcast' },
        ],
        title: 'Navigating Special Educational Needs in Singapore: A Path to Inclusion',
      },
      {
        id: 2,

        to: '/content/1',
        tags: [
          { variant: 'purple', content: 'Special Educational Needs' },
          { variant: 'slate', content: 'Podcast' },
        ],
        title: 'Navigating Special Educational Needs in Singapore: A Path to Inclusion',
      },
      {
        id: 3,

        to: '/content/1',
        tags: [
          { variant: 'purple', content: 'Special Educational Needs' },
          { variant: 'slate', content: 'Podcast' },
        ],
        title: 'Navigating Special Educational Needs in Singapore: A Path to Inclusion',
      },
    ],
    collections: [
      {
        id: 1,
        tag: 'Artificial Intelligence',
        title: 'Learn to use AI',
        numberofpodcasts: 8,
        numberofnotes: 3,
        to: '/collection/1',
        type: 'AI',
      },
      {
        id: 2,
        tag: 'Special Educational Needs',
        title: 'SEN peer support',
        numberofpodcasts: 12,
        numberofnotes: 2,
        to: '/collection/2',
        type: 'SEN',
      },
      {
        id: 3,
        tag: 'Teacher mental health literacy',
        title: 'Understanding Mental Health',
        numberofpodcasts: 10,
        numberofnotes: 1,
        to: '/collection/3',
        type: 'MENTAL_HEALTH',
      },
    ],
  };
};
