import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const learningUnits = [
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
    {
      id: 4,
      to: '/content/1',
      tags: [
        { variant: 'purple', content: 'Special Educational Needs' },
        { variant: 'slate', content: 'Podcast' },
      ],
      title: 'Navigating Special Educational Needs in Singapore: A Path to Inclusion',
    },
    {
      id: 5,
      to: '/content/1',
      tags: [
        { variant: 'purple', content: 'Special Educational Needs' },
        { variant: 'slate', content: 'Podcast' },
      ],
      title: 'Navigating Special Educational Needs in Singapore: A Path to Inclusion',
    },
  ];

  const collections = [
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
    {
      id: 4,
      tag: 'Teacher mental health literacy',
      title: 'Understanding Mental Health',
      numberofpodcasts: 10,
      numberofnotes: 1,
      to: '/collection/3',
      type: 'MENTAL_HEALTH',
    },
  ];

  return {
    learningUnits: learningUnits.slice(0, 3),
    collections: collections.slice(0, 3),
  };
};
