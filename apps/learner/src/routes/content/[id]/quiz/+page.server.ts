import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {
    title:
      'The quick brown fox jumps over the lazy dog The quick brown fox jumps over the lazy dog',
    questionAnswers: [
      {
        id: 123,
        question: 'The quick brown fox jumps over the lazy dog ',
        options: ['The quick', 'brown fox jumps', 'over the', 'lazy dog'],
        answer: 2,
        explanation: 'This is an explanation.',
      },
      {
        id: 234,
        question:
          'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor',
        options: ['Lorem', 'ipsum', 'dolor', 'sit amet'],
        answer: 2,
        explanation: 'This is an explanation.',
      },
    ],
  };
};
