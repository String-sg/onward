import { TimeUnit } from '@valkey/valkey-glide';

import { db } from '../db';
import { valkey } from '../valkey';

/**
 * The namespace used for storing base64-encoded avatar in Valkey.
 */
const AVATAR_NAMESPACE = 'avatar';
/**
 * The time-to-live (TTL) for base64-encoded avatar in Valkey.
 */
const AVATAR_TTL = 24 * 60 * 60;

/**
 * Retrieves a base64-encoded avatar from Valkey. If the avatar is not found, it will be fetched
 * from the user's avatar URL and cached in Valkey. The returned base64 string is already formatted
 * for direct use as the `src` of an `<img>` element.
 *
 * @param userId - The ID of the user whose avatar should be retrieved.
 * @returns The base64-encoded avatar, or `null` if the user is not found.
 */
export async function getBase64EncodedAvatar(userId: bigint): Promise<string | null> {
  let avatar = await valkey.get(`${AVATAR_NAMESPACE}:${userId}`);
  if (avatar) {
    return avatar.toString();
  }

  const user = await db.user.findUnique({
    select: {
      avatarURL: true,
    },
    where: {
      id: userId,
    },
  });
  if (!user) {
    return null;
  }

  const resp = await fetch(user.avatarURL);
  const buf = await resp.arrayBuffer();
  const contentType = resp.headers.get('content-type') || 'image/jpeg';

  avatar = `data:${contentType};base64,${Buffer.from(buf).toString('base64')}`;
  await valkey.set(`${AVATAR_NAMESPACE}:${userId}`, avatar, {
    expiry: { type: TimeUnit.Seconds, count: AVATAR_TTL },
  });

  return avatar;
}
