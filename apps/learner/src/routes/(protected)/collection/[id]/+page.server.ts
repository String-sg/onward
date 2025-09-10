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
  };
};
