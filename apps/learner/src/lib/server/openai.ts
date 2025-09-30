import OpenAI from 'openai';

import { env } from '$env/dynamic/private';

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

const client = new OpenAI({
  apiKey: env.OPENAI_API_KEY || '',
  baseURL: env.OPENAI_BASE_URL || '',
});

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
}: {
  query: string;
  history: {
    role:
      | OpenAI.ChatCompletionUserMessageParam['role']
      | OpenAI.ChatCompletionAssistantMessageParam['role'];
    content: string;
  }[];
  context: string[];
}): Promise<string> {
  const response = await client.chat.completions.create({
    model: 'gpt-5-nano',
    messages: [
      {
        role: 'developer',
        content: DEVELOPER_MESSAGE,
      },
      {
        role: 'developer',
        content:
          '# Context: \n\n' +
          (context.length === 0
            ? 'No relevant context found.'
            : `${context.map((cont) => `- ${cont}`).join('\n\n')}`),
      },
      ...history,
      {
        role: 'user',
        content: query,
      },
    ],
  });

  return response.choices[0].message.content || '';
}
