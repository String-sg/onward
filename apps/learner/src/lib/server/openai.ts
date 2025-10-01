import { countTokens, isWithinTokenLimit } from 'gpt-tokenizer';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources';

import { env } from '$env/dynamic/private';

interface Message {
  role: 'USER' | 'ASSISTANT';
  content: string;
  tokenCount: number;
}

enum Role {
  USER = 'user',
  ASSISTANT = 'assistant',
}

/**
 * The maximum input tokens.
 */
const MAX_CHAT_INPUT_TOKENS = 272_000 as const;
const MAX_EMBEDDING_INPUT_TOKENS = 8192 as const;

const DEVELOPER_MESSAGE = `
# Role and Objective
You are a patient and knowledgeable educational assistant. Your primary goal is to help users learn new concepts, understand complex topics, and solve academic problems. You must act as a supportive mentor, not just a fact-teller. Your responses should be tailored to the user's current level of understanding and encourage critical thinking.

# Instructions
1. **Always based your answer on the provided context:** Use only the information from the provided context. If the answer is not contained within the context, politely inform the user that you cannot provide an answer based on the available information.
2. **Admit Limitations and Do Not Hallucinate:** If you don't know the answer or can't perform a requested task, state this clearly and offer to help in another way. **Do not invent, fabricate information or offer help outside of the provided context.**
3. **Maintain a Supportive and Encouraging Tone:** Use positive language. Acknowledge the user's effort and progress.
4. **Break Down Complex Information:** Deconstruct difficult topics into smaller, more manageable parts. Use analogies and real-world examples to make abstract concepts relatable.
5. **Encourage Active Learning:** Instead of giving the full answer directly, ask questions to guide the user toward the solution. Prompt them to explain their reasoning.
6. **Verify Understanding:** After explaining a concept, ask the user to summarize it or apply it in a new scenario to ensure they have grasped the material.

# Output Format
1. Your responses should feel like a natural conversation.
2. Use Markdown **only where semantically correct** (e.g., for **bolding**, *italicizing*, \`inline code\`, \`\`\`code fences\`\`\`, lists, tables).`;

const client = new OpenAI({
  apiKey: env.OPENAI_API_KEY || '',
  baseURL: env.OPENAI_BASE_URL || '',
});

function truncateHistory(
  developerMessage: string,
  contextMessage: string,
  history: Message[],
  query: string,
): Message[] {
  const tokenAllowance =
    MAX_CHAT_INPUT_TOKENS -
    (countTokens(developerMessage) + countTokens(contextMessage) + countTokens(query));

  const conversationTurns: { startIndex: number; tokenCount: number }[] = [];
  for (let i = 0; i < history.length; i += 2) {
    conversationTurns.push({
      startIndex: i,
      tokenCount: history[i].tokenCount + (i + 1 < history.length ? history[i + 1].tokenCount : 0),
    });
  }

  let left = 0;
  let right = conversationTurns.length - 1;
  let cutOffIndex = conversationTurns.length;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const latestConvoTokens = conversationTurns
      .slice(mid)
      .reduce((acc, turn) => acc + turn.tokenCount, 0);
    console.log({ mid, latestConvoTokens });

    if (latestConvoTokens <= tokenAllowance) {
      cutOffIndex = mid;
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }
  console.log({ historyCutOffIndex: conversationTurns[cutOffIndex].startIndex });

  return history.slice(conversationTurns[cutOffIndex].startIndex);
}

/**
 * Calls LLM to complete a chat.
 *
 * @param query - The query to complete.
 * @param history - A list of previous messages.
 * @param context - A list of relevant context.
 * @returns The response from the LLM.
 *
 * @example
 * ```ts
 * const response = await completions(
 *   "What is AI?",
 *   [{ role: "user", content: "Hello" }, { role: "assistant", content: "Hi there!" }],
 *   ["Artificial Intelligence", "Machine Learning"]
 * );
 * ```
 */
export async function completions({
  query,
  history,
  context,
  historyTokens,
}: {
  query: string;
  history: Message[];
  context: string[];
  historyTokens: number;
}): Promise<string> {
  const contextMessage: string =
    '# Context \n\n' +
    (context.length === 0
      ? 'No relevant context found.'
      : `${context.map((cont) => `- ${cont}`).join('\n\n')}`);

  const messages: ChatCompletionMessageParam[] = [
    {
      role: 'developer',
      content: DEVELOPER_MESSAGE,
    },
    {
      role: 'developer',
      content: contextMessage,
    },
    {
      role: Role.USER,
      content: query,
    },
  ];

  const developerMessageTokens = countTokens(DEVELOPER_MESSAGE);
  const contextMessageTokens = countTokens(contextMessage);
  const queryTokens = countTokens(query);
  console.log({ developerMessageTokens, contextMessageTokens, historyTokens, queryTokens });

  if (
    historyTokens + developerMessageTokens + contextMessageTokens + queryTokens >=
    MAX_CHAT_INPUT_TOKENS
  ) {
    console.log('Truncating history');
    history = truncateHistory(DEVELOPER_MESSAGE, contextMessage, history, query);
  }

  const response = await client.chat.completions.create({
    model: 'gpt-5-nano',
    messages: messages.splice(
      2,
      0,
      ...history.map((msg) => ({
        role: Role[msg.role],
        content: msg.content,
      })),
    ),
  });

  return response.choices[0].message.content || '';
}

export function isWithinMaxEmbeddingInputTokens(query: string): boolean {
  return isWithinTokenLimit(query, MAX_EMBEDDING_INPUT_TOKENS) === false ? false : true;
}

export function getTokenCount(text: string): number {
  return countTokens(text);
}
