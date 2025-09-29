import { env } from '$env/dynamic/private';

import { createOpenAIProvider } from './openai';

export interface CompletionArgs {
  query: { content: string; tokenCount: number };
  history: {
    role: 'USER' | 'ASSISTANT';
    content: string;
    tokenCount: number;
  }[];
  context: string[];
  totalHistoryTokens: number;
  messagesToSkipped: number;
}

export interface CompletionResponse {
  answer: string;
  tokenCount: number;
  messagesToSkipped: number;
  totalHistoryTokens: number;
}

export interface AIProvider {
  completions(params: CompletionArgs): Promise<CompletionResponse>;
  isWithinMaxEmbeddingInputTokens(count: number): boolean;
  countToken(text: string): number;
}

let AI_PROVIDER: AIProvider;

function createAIProvider(): AIProvider {
  const providerType = env.AI_PROVIDER || 'openai';

  switch (providerType) {
    case 'openai':
      return createOpenAIProvider();
    default:
      return createOpenAIProvider();
  }
}

export function getAIProvider(): AIProvider {
  if (AI_PROVIDER) {
    return AI_PROVIDER;
  }

  AI_PROVIDER = createAIProvider();

  return AI_PROVIDER;
}
