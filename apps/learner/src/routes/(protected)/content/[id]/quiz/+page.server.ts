import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {
    questions: [
      {
        id: 123,
        question: 'What is the color of the sky?',
        options: ['Blue', 'Red', 'Green', 'Yellow'],
        answerIndex: 0,
        explanation: 'This is an explanation.',
      },
      {
        id: 234,
        question:
          'This is a super long question that is going to wrap around to the next line and then some more text to see how it looks. It should be long enough to wrap around to the next line and then some more text to see how it looks. I want to see how it looks when it wraps around to the next line and then some more text to see how it looks.',
        options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
        answerIndex: 0,
        explanation:
          'This is an explanation. It is a very long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long explanation.',
      },
      {
        id: 345,
        question: 'How many days are in a week?',
        options: ['7', '8', '9', '10'],
        answerIndex: 0,
        explanation: 'This is an explanation.',
      },
    ],
  };
};
