import { countTokens } from 'gpt-tokenizer/encoding/o200k_base';
import OpenAI from 'openai';
import type { ChatCompletion, ChatCompletionCreateParams } from 'openai/resources';

import { env } from '$env/dynamic/private';

import type { AIProvider, CompletionArgs, CompletionResponse } from '.';

/**
 * The maximum input tokens.
 */
const MAX_CHAT_INPUT_TOKENS = 272_000 as const;
const MAX_EMBEDDING_INPUT_TOKENS = 8192 as const;

/**
 * The mapping of internal roles to OpenAI roles.
 */
const Roles = {
  USER: 'user',
  ASSISTANT: 'assistant',
} as const;

/**
 * The developer/system prompt.
 */
const DEVELOPER_MESSAGE = `
# Role and Objective
You are a patient and knowledgeable educational assistant. Your primary goal is to help users learn new concepts, understand complex topics, and solve academic problems. You must act as a supportive mentor, not just a fact-teller. Your responses should be tailored to the user's current level of understanding and encourage critical thinking.

# Instructions
1. **Maintain a Supportive and Encouraging Tone:** Use positive language. Acknowledge the user's effort and progress.
2. **Break Down Complex Information:** Deconstruct difficult topics into smaller, more manageable parts. Use analogies and real-world examples to make abstract concepts relatable.
3. **Encourage Active Learning:** Instead of giving the full answer directly, ask questions to guide the user toward the solution. Prompt them to explain their reasoning.
4. **Verify Understanding:** After explaining a concept, ask the user to summarize it or apply it in a new scenario to ensure they have grasped the material.
5. **Admit Limitations and Do Not Hallucinate:** If you don't know the answer or can't perform a requested task, state this clearly and offer to help in another way. **Do not invent or fabricate information.**

# Output Format
Your responses should feel like a natural conversation and use Markdown **only where semantically correct** (e.g., for **bolding**, *italicizing*, \`inline code\`, \`\`\`code fences\`\`\`, lists, tables).`;

/**
 * The API client.
 */
const client = new OpenAI({
  apiKey: env.OPENAI_API_KEY || '',
  baseURL: env.OPENAI_BASEURL || '',
});

/**
 * Truncates messages from the start of history recursively
 *
 *
 * @param history - The chat history.
 * @param totalChatInputTokens - The total chat input tokens.
 * @param messagesToSkip - The messages to skip.
 * @returns The truncated chat history, total chat input tokens, and messages to skip.
 *
 * @example
 * ```ts
 * const { history, totalChatInputTokens, messagesToSkip } = truncateMessages({
 *   history,
 *   totalChatInputTokens,
 *   messagesToSkip,
 * });
 * console.log(history, totalChatInputTokens, messagesToSkip);
 * // [{ role: 'USER', content: '...' }, { role: 'ASSISTANT', content: '...' }], 1500, 2
 * ```
 */
function truncateMessages({
  history,
  totalChatInputTokens,
  messagesToSkip,
}: {
  history: CompletionArgs['history'];
  totalChatInputTokens: number;
  messagesToSkip: number;
}): {
  history: CompletionArgs['history'];
  totalChatInputTokens: number;
  messagesToSkip: number;
} {
  const removedMessage = history.shift();
  if (!removedMessage || !('tokenCount' in removedMessage)) {
    return {
      history,
      totalChatInputTokens,
      messagesToSkip,
    };
  }

  const tokenDiff = totalChatInputTokens - removedMessage.tokenCount;
  if (tokenDiff >= MAX_CHAT_INPUT_TOKENS) {
    return truncateMessages({
      history,
      totalChatInputTokens: tokenDiff,
      messagesToSkip: (messagesToSkip += 1),
    });
  }

  return {
    history,
    totalChatInputTokens,
    messagesToSkip,
  };
}

/** Completes the query.
 *
 * @param query - The query content and token count.
 * @param history - The chat history.
 * @param context - The knowledge context.
 * @param totalHistoryTokens - The total tokens of history.
 * @param messagesToSkip - The number of messages to skip.
 * @returns The answer, token count, messages to skip, and total tokens of history.
 *
 * @example
 * ```ts
 * const response = await completions({
 *   query: { content: "What is AI?", tokenCount: 5 },
 *   history: [
 *     { role: "USER", content: "Explain machine learning.", tokenCount: 10 },
 *     { role: "ASSISTANT", content: "Machine learning is...", tokenCount: 15 }
 *   ],
 *   context: ["AI is the simulation of human intelligence..."],
 *   totalHistoryTokens: 25,
 *   messagesToSkip: 0
 * });
 * console.log(response);
 * // {
 * //   answer: "AI stands for Artificial Intelligence...",
 * //   tokenCount: 7,
 * //   messagesToSkip: 0,
 * //   totalHistoryTokens: 32
 * // }
 * ```
 */
async function completions({
  query,
  history,
  context,
  totalHistoryTokens,
  messagesToSkip,
}: CompletionArgs): Promise<CompletionResponse> {
  const contextPrompt =
    '# Context: \n\n' +
    (context.length === 0
      ? 'No relevant context found.'
      : `${context.map((cont) => `- ${cont}`).join('\n\n')}`);

  const developerPromptTokenCount: number = countTokens(DEVELOPER_MESSAGE + contextPrompt);

  let totalChatInputTokens: number = developerPromptTokenCount;
  totalChatInputTokens += totalHistoryTokens;
  totalChatInputTokens += query.tokenCount;

  if (totalChatInputTokens >= MAX_CHAT_INPUT_TOKENS) {
    ({ history, totalChatInputTokens, messagesToSkip } = truncateMessages({
      history,
      totalChatInputTokens,
      messagesToSkip,
    }));
  }

  const request: ChatCompletionCreateParams = {
    model: 'gpt-5-nano',
    messages: [
      {
        role: 'developer',
        content: DEVELOPER_MESSAGE,
      },
      {
        role: 'developer',
        content: contextPrompt,
      },
      ...history.map((msg) => ({
        role: Roles[msg.role],
        content: msg.content,
      })),
      {
        role: Roles.USER,
        content: query.content,
      },
    ],
  };

  const response: ChatCompletion = await client.chat.completions.create(request);
  const answer: string = response.choices[0].message.content || '';

  return {
    answer,
    tokenCount: countTokens(answer),
    totalHistoryTokens: totalChatInputTokens - developerPromptTokenCount,
    messagesToSkip,
  };
}

/**
 * Creates the provider.
 *
 * @returns The provider.
 */
export function createOpenAIProvider(): AIProvider {
  return {
    completions,
    isWithinMaxEmbeddingInputTokens: (count: number): boolean => {
      return count < MAX_EMBEDDING_INPUT_TOKENS;
    },
    countToken: (text: string): number => {
      return countTokens(text);
    },
  };
}
