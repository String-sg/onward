import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {
    id: 1,
    title: 'Navigating Special Educational Needs: A Path to Inclusion',
    tags: ['Special Educational Needs'],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  };
};
