import OpenAI from 'openai';

import { env } from '$env/dynamic/private';

export const openAI = new OpenAI({
  apiKey: env.OPENAI_API_KEY || '',
  baseURL: env.OPENAI_BASE_URL || '',
});
