import type { Variant } from '$lib/components/Badge.svelte';

import type { PageServerLoad } from './$types';

export interface LearningUnit {
  id: number;
  title: string;
  duration: number;
  audioUrl: string;
  createdAt: string;
  tags: { variant: Variant; content: string }[];
  progress?: {
    currentTime: number;
    completed: boolean;
    lastPlayed: string;
  };
}

export const load: PageServerLoad = async ({ params }) => {
  const collectionId = params.id;

  // Mock collection data - in real app, this would fetch from database
  const collections = {
    '1': {
      id: 1,
      title: 'SEN peer support',
      description:
        'Explore the world of Special Educational Needs (SEN) peer support that indicates Singapore specific peer support knowledges, case studies and more to gain knowledge about SEN. This topic encompasses a variety of bite-sized.',
      learningUnits: [
        {
          id: 1,
          title: 'Navigating Special Educational Needs in Singapore: A Path to Inclusion',
          duration: 186,
          contentUrl: '/audio-1.mp3',
          createdAt: '2024-01-15',
          tags: [{ variant: 'purple' as Variant, content: 'Special Educational Needs' }],
          learningJourney: {
            lastCheckpoint: 20.5,
            isCompleted: false,
          },
        },
      ],
    },
    '2': {
      id: 2,
      title: 'Learn to use AI',
      description:
        'Discover the fundamentals of artificial intelligence and learn how to effectively integrate AI tools into your daily workflow. This collection covers practical AI applications, best practices, and hands-on techniques.',
      learningUnits: [
        {
          id: 2,
          title: 'Introduction to AI Tools',
          duration: 195,
          contentUrl: '/audio-6.mp3',
          createdAt: '2024-01-14',
          tags: [{ variant: 'blue' as Variant, content: 'Mental Health' }],
          learningJourney: {
            lastCheckpoint: 240.2,
            isCompleted: false,
          },
        },
      ],
    },
  };

  const collection = collections[collectionId as keyof typeof collections];

  return {
    collection,
  };
};
