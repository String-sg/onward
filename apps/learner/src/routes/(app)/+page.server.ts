import type { Variant } from '$lib/components/Badge.svelte';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {
    recentlyLearned: [
      {
        id: 1,
        title: 'Navigating Special Educational Needs in Singapore: A Path to Inclusion',
        duration: 186,
        contentURL: '/audio-1.mp3',
        createdAt: '2024-01-15',
        tags: [{ variant: 'purple' as Variant, content: 'Special Educational Needs' }],
        learningJourney: {
          lastCheckpoint: 20.5,
          isCompleted: false,
        },
      },
      {
        id: 2,
        title: 'Introduction to AI Tools',
        duration: 269,
        contentURL: '/audio-2.mp3',
        createdAt: '2024-01-14',
        tags: [{ variant: 'amber' as Variant, content: 'Artificial Intelligence' }],
        learningJourney: {
          lastCheckpoint: 240.2,
          isCompleted: false,
        },
      },
    ],
  };
};
