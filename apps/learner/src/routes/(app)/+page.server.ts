import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {
    id: 1,
    tags: ['Special Educational Needs'],
    title: 'Navigating Special Educational Needs: A Path to Inclusion',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  };
};
