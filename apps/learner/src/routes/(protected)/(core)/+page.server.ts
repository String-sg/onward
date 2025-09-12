import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {
    learningUnits: [
      {
        id: 1,
        tags: [{ code: 'SEN', label: 'Special Educational Needs' }],
        title: 'Navigating Special Education Needs in Singapore: A Path to Inclusion',
        url: 'ADHD in Classrooms_ Strategies That Work.wav',
        createdBy: 'DXD Product Team',
      },
      {
        id: 2,
        tags: [{ code: 'SEN', label: 'Special Educational Needs' }],
        title: 'Testing the Waters: A Guide to Special Educational Needs in Singapore',
        url: 'ADHD in Classrooms_ Strategies That Work.wav',
        createdBy: 'DXD Product Team',
      },
      {
        id: 3,
        tags: [{ code: 'SEN', label: 'Special Educational Needs' }],
        title: 'The quick brown fox jumps over the lazy dog',
        url: 'ADHD in Classrooms_ Strategies That Work.wav',
        createdBy: 'DXD Product Team',
      },
    ],
  };
};
