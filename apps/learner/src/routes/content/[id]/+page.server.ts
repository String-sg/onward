import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {
    id: '1',
    tags: ['Special Educational Needs'],
    title: 'Navigating Special Educational Needs: A Path to Inclusion',
    summary:
      "This podcast explores how teachers in Singapore can effectively support students with Special Educational Needs (SEN) in mainstream classrooms, fostering inclusion through practical strategies and collaboration. Learn key approaches to address diverse learning needs, align with MOE's inclusive education goals, and create equitable learning environments.",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  };
};
