import { TimeUnit } from '@valkey/valkey-glide';

import { valkey } from '$lib/server/valkey.js';

const CACHE_DURATION_SECONDS = 24 * 60 * 60; // 24 hours
const CACHE_KEY_PREFIX = 'avatar:';

/**
 * Generates Valkey key for cached avatar data
 */
function generateCacheKey(userId: string): string {
  return `${CACHE_KEY_PREFIX}${userId}`;
}

/**
 * Generates Valkey key for cached avatar metadata
 */
function generateMetadataKey(userId: string): string {
  return `${CACHE_KEY_PREFIX}${userId}:meta`;
}

/**
 * Downloads and caches a profile picture in Valkey as base64
 */
async function cacheProfilePicture(userId: string, googleAvatarUrl: string): Promise<string> {
  // Download the image from Google
  const response = await fetch(googleAvatarUrl);
  const imageBuffer = await response.arrayBuffer();
  const base64Image = Buffer.from(imageBuffer).toString('base64');
  const contentType = response.headers.get('content-type') || 'image/jpeg';

  const cacheKey = generateCacheKey(userId);
  const metadataKey = generateMetadataKey(userId);

  // Store image data and metadata in Valkey with expiration
  await Promise.all([
    valkey.set(cacheKey, base64Image, {
      expiry: { type: TimeUnit.Seconds, count: CACHE_DURATION_SECONDS },
    }),
    valkey.set(
      metadataKey,
      JSON.stringify({
        contentType,
        originalUrl: googleAvatarUrl,
        cachedAt: new Date().toISOString(),
      }),
      {
        expiry: { type: TimeUnit.Seconds, count: CACHE_DURATION_SECONDS },
      },
    ),
  ]);

  // Return data URL for immediate use
  return `data:${contentType};base64,${base64Image}`;
}

/**
 * Gets cached profile picture from Valkey
 */
async function getCachedProfilePicture(userId: string): Promise<string | null> {
  const cacheKey = generateCacheKey(userId);
  const metadataKey = generateMetadataKey(userId);

  const [imageData, metadataStr] = await Promise.all([
    valkey.get(cacheKey),
    valkey.get(metadataKey),
  ]);

  if (!imageData || !metadataStr) {
    return null;
  }

  const metadata = JSON.parse(metadataStr.toString());
  return `data:${metadata.contentType};base64,${imageData}`;
}

/**
 * Stores profile picture in cache and return cached image
 */
export async function getAvatarUrl(userId: string, googleAvatarUrl: string): Promise<string> {
  const cachedUrl = await getCachedProfilePicture(userId);

  if (cachedUrl) {
    return cachedUrl;
  }

  return await cacheProfilePicture(userId, googleAvatarUrl);
}
