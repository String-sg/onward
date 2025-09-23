import Weaviate from 'weaviate-client';

import { building } from '$app/environment';
import { env } from '$env/dynamic/private';

const httpURL = new URL(env.WEAVIATE_URL || 'http://localhost:50050');
const grpcURL = new URL(env.WEAVIATE_GRPC_URL || 'http://localhost:50051');

export const weaviate = await Weaviate.connectToCustom({
  httpHost: httpURL.hostname,
  httpPort: httpURL.protocol === 'https:' ? 443 : parseInt(httpURL.port),
  httpSecure: httpURL.protocol === 'https:',
  grpcHost: grpcURL.hostname,
  grpcPort: grpcURL.protocol === 'https:' ? 443 : parseInt(grpcURL.port),
  grpcSecure: grpcURL.protocol === 'https:',
  authCredentials: new Weaviate.ApiKey(env.WEAVIATE_API_KEY || 'secret'),
  headers: {
    'X-OpenAI-Baseurl': env.WEAVIATE_OPENAI_BASE_URL || '',
    'X-OpenAI-Api-Key': env.WEAVIATE_OPENAI_EMBEDDING_API_KEY || '',
  },
  skipInitChecks: true,
});

export async function weaviateSearch(query: string) {
  const response = await weaviate.collections.use('LearningUnit').query.hybrid(query, {
    queryProperties: ['content'],
    targetVector: ['content_vector'],
    maxVectorDistance: 0.6,
    limit: 5,
  });

  return response;
}

if (!building) {
  const [isLive, isReady] = await Promise.all([weaviate.isLive(), weaviate.isReady()]);
  if (!isLive || !isReady) {
    await weaviate.close();
    throw new Error('Weaviate connection failed: Instance is not live or ready.');
  }
}

// Close the connection to the Weaviate instance when the server shuts down.
process.on('sveltekit:shutdown', async () => {
  await weaviate.close();
});
