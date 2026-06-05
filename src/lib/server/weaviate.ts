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
    'X-Glow-Secret': env.WEAVIATE_GLOW_SECRET || '',
    'X-OpenAI-Baseurl': env.WEAVIATE_OPENAI_BASE_URL || '',
    'X-OpenAI-Api-Key': env.WEAVIATE_OPENAI_EMBEDDING_API_KEY || '',
  },
  skipInitChecks: true,
});

if (!building) {
  const [isLive, isReady] = await Promise.all([client.isLive(), client.isReady()]);
  if (!isLive || !isReady) {
    await client.close();
    throw new Error('Weaviate connection failed: Instance is not live or ready.');
  }
}

// Close the connection to the Weaviate instance when the server shuts down.
process.on('sveltekit:shutdown', async () => {
  await client.close();
});

/**
 * The properties stored on a `LearningUnit` object in Weaviate.
 *
 * Declared as a `type` so it satisfies Weaviate's `Properties` constraint.
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type LearningUnit = {
  learning_unit_id: string;
  content: string;
};

/**
 * Search for relevant learning content using both keyword and vector similarity.
 *
 * @param query - The query to search for.
 * @returns A list of relevant learning units.
 */
export async function search(query: string): Promise<LearningUnit[]> {
  const result = await client.collections.get<LearningUnit>('LearningUnit').query.hybrid(query, {
    limit: 60, // caps how many hits feed the answer prompt
    returnProperties: ['learning_unit_id', 'content'],
    alpha: 0.5,
    fusionType: 'RelativeScore',
    maxVectorDistance: 0.55, // relevance cutoff: drops vector-distant (off-topic) matches
    queryProperties: ['content'],
    targetVector: ['content_vector'],
  });

  return result.objects.map((obj) => obj.properties);
}
