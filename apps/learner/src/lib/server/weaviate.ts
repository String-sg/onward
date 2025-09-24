import Weaviate from 'weaviate-client';

import { building } from '$app/environment';
import { env } from '$env/dynamic/private';

const httpURL = new URL(env.WEAVIATE_URL || 'http://localhost:50050');
const grpcURL = new URL(env.WEAVIATE_GRPC_URL || 'http://localhost:50051');

const client = await Weaviate.connectToCustom({
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

// Close the connection to the Weaviate instance when the server shuts down.
process.on('sveltekit:shutdown', async () => {
  await client.close();
});

if (!building) {
  const [isLive, isReady] = await Promise.all([client.isLive(), client.isReady()]);
  if (!isLive || !isReady) {
    await client.close();
    throw new Error('Weaviate connection failed: Instance is not live or ready.');
  }
}

/**
 * Search for relevant learning content by using both keyword and vector similarity.
 *
 * @param query - The query to search for.
 * @returns A list of relevant learning content.
 *
 * @example
 * ```ts
 * const results = await search("What is artificial intelligence?");
 * console.log(results); // ["Content about AI...", "Another related content..."]
 * ```
 */
export async function search(query: string): Promise<string[]> {
  const result = await client.collections
    .get<{ content: string }>('LearningUnit')
    .query.hybrid(query, {
      queryProperties: ['content'],
      targetVector: ['content_vector'],
      maxVectorDistance: 0.6,
      returnProperties: ['content'],
      limit: 5,
    });

  return result.objects.map((obj) => obj.properties.content);
}
