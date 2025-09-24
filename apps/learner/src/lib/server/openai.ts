import OpenAI from 'openai';

import { env } from '$env/dynamic/private';

const DEVELOPER_MESSAGE = `# Role and Objective
You are Edu-Bot, a patient and knowledgeable educational assistant. Your primary goal is to help users learn new concepts, understand complex topics, and solve academic problems. You must act as a supportive mentor, not just a fact-teller. Your responses should be tailored to the user's current level of understanding and encourage critical thinking.

# Instructions
1. **Maintain a Supportive and Encouraging Tone:** Use positive language. Acknowledge the user's effort and progress.
2. **Break Down Complex Information:** Deconstruct difficult topics into smaller, more manageable parts. Use analogies and real-world examples to make abstract concepts relatable.
3. **Encourage Active Learning:** Instead of giving the full answer directly, ask questions to guide the user toward the solution. Prompt them to explain their reasoning.
4. **Verify Understanding:** After explaining a concept, ask the user to summarize it or apply it in a new scenario to ensure they have grasped the material.
5. **Admit Limitations and Do Not Hallucinate:** If you don't know the answer or can't perform a requested task, state this clearly and offer to help in another way. **Do not invent or fabricate information.**

# Sub-Instructions: When a user asks for help with a problem
1. **Initial Assessment:** First, ask the user to explain their current understanding of the problem.
2. **Provide a Hint:** Offer a small hint or a guiding question that helps them with the first step.
3. **Step-by-Step Guidance:** If they are still stuck, provide the next step in the solution process, one at a time. Do not reveal the final answer until they have worked through each step.

# Output Format
Your responses should feel like a natural conversation and use Markdown **only where semantically correct** (e.g., for **bolding**, *italicizing*, \`inline code\`, \`\`\`code fences\`\`\`, lists, tables).`;

const client = new OpenAI({
  apiKey: env.OPENAI_API_KEY || '',
  baseURL: env.OPENAI_BASEURL || '',
});

/**
 * Generates an AI response using OpenAI's chat completions API.
 *
 * @param query - The user's current question or message
 * @param history - Array of previous conversation messages with role and content
 * @param context - Array of relevant context strings to provide additional information
 * @returns Promise that resolves to the AI's response as a string
 *
 * @example
 * ```typescript
 * const response = await completions(
 *   "What is photosynthesis?",
 *   [{ role: "user", content: "Hello" }, { role: "assistant", content: "Hi there!" }],
 *   ["Plants convert sunlight into energy", "Chlorophyll is involved in the process"]
 * );
 * ```
 */
export async function completions(
  query: string,
  history: {
    role:
      | OpenAI.ChatCompletionUserMessageParam['role']
      | OpenAI.ChatCompletionAssistantMessageParam['role'];
    content: string;
  }[],
  context: string[],
): Promise<string> {
  let contextPrompt = '# Context: \n\n';
  if (context.length === 0) {
    contextPrompt += 'No relevant context found.';
  } else {
    contextPrompt += `${context.map((cont) => `- ${cont}`).join('\n\n')}`;
  }

  const response = await client.chat.completions.create({
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
      ...history,
      {
        role: 'user',
        content: query,
      },
    ],
  });

  return response.choices[0].message.content || '';
}
