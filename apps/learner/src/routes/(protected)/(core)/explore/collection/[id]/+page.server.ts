import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {
    learningUnits: [
      {
        id: 1,
        to: '/unit/1',
        tags: [
          { variant: 'purple', content: 'Special Educational Needs' },
          { variant: 'slate', content: 'Podcast' },
        ],
        title: 'Navigating Special Educational Needs in Singapore: A Path to Inclusion',
        createdAt: new Date(),
        createdBy: 'DXD Product Team',
      },
      {
        id: 2,
        to: '/unit/1',
        tags: [
          { variant: 'purple', content: 'Special Educational Needs' },
          { variant: 'slate', content: 'Podcast' },
        ],
        title: 'Navigating Special Educational Needs in Singapore: A Path to Inclusion',
        createdAt: new Date(),
        createdBy: 'DXD Product Team',
      },
      {
        id: 3,
        to: '/unit/1',
        tags: [
          { variant: 'purple', content: 'Special Educational Needs' },
          { variant: 'slate', content: 'Podcast' },
        ],
        title: 'Navigating Special Educational Needs in Singapore: A Path to Inclusion',
        createdAt: new Date(),
        createdBy: 'DXD Product Team',
      },
    ],
  };
};
