import OpenAI from 'openai';

import { building } from '$app/environment';
import { env } from '$env/dynamic/private';

export const openAI = new OpenAI({
  apiKey: env.WEAVIATE_OPENAI_API_KEY || '',
  baseURL: env.WEAVIATE_OPENAI_BASE_URL || '',
});

if (!building) {
  const isReady = await openAI.models
    .list()
    .then(() => true)
    .catch(() => false);

  if (!isReady) {
    throw new Error('OpenAI connection failed.');
  }
}
