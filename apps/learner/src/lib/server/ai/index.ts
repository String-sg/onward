import { env } from '$env/dynamic/private';

import { createOpenAIProvider } from './openai';

export interface CompletionArgs {
  /**
   * The query content and token count.
   */
  query: { content: string; tokenCount: number };
  /**
   * The chat history.
   */
  history: {
    role: 'USER' | 'ASSISTANT';
    content: string;
    tokenCount: number;
  }[];
  /**
   * The knowledge context.
   */
  context: string[];
  /**
   * The total tokens of history.
   */
  totalHistoryTokens: number;
  /**
   * The number of messages to skip.
   */
  messagesToSkip: number;
}
export interface CompletionResponse {
  /**
   * The AI-generated answer.
   */
  answer: string;
  /**
   * The token count of the answer.
   */
  tokenCount: number;
  /**
   * The number of messages to skip.
   */
  messagesToSkip: number;
  /**
   * The total tokens of history.
   */
  totalHistoryTokens: number;
}
export interface AIProvider {
  /**
   * Completes the query.
   */
  completions(params: CompletionArgs): Promise<CompletionResponse>;
  /**
   * Checks if the tokens is within the maximum embedding input limit.
   */
  isWithinMaxEmbeddingInputTokens(count: number): boolean;
  /**
   * Count the tokens.
   */
  countToken(text: string): number;
}

/**
 * The singleton instance of the provider.
 */
let AI_PROVIDER: AIProvider;

/**
 * Creates a provider.
 * @returns The AI provider.
 */
function createAIProvider(): AIProvider {
  const providerType = env.AI_PROVIDER || 'openai';

  switch (providerType) {
    case 'openai':
      return createOpenAIProvider();
    default:
      return createOpenAIProvider();
  }
}

/**
 * Gets the AI provider instance.
 * @returns The AI provider.
 */
export function getAIProvider(): AIProvider {
  if (AI_PROVIDER) {
    return AI_PROVIDER;
  }

  AI_PROVIDER = createAIProvider();

  return AI_PROVIDER;
}
