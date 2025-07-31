import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {
    id: 1,
    tags: ['Special Educational Needs'],
    title: 'Navigating Special Educational Needs: A Path to Inclusion',
  };
};
