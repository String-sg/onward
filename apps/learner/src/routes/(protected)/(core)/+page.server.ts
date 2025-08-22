import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {
    learningUnits: [
      {
        id: 1,
        title: 'Navigating Special Education Needs in Singapore: A Path to Inclusion',
        url: 'ADHD in Classrooms_ Strategies That Work.wav',
      },
      {
        id: 2,
        title: 'Testing the Waters: A Guide to Special Educational Needs in Singapore',
        url: '/ADHD in Classrooms_ Strategies That Work.wav',
      },
      {
        id: 3,
        title: 'The quick brown fox jumps over the lazy dog',
        url: '/ADHD in Classrooms_ Strategies That Work.wav',
      },
    ],
  };
};
