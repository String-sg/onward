import { type CloudfrontSignedCookiesOutput, getSignedCookies } from '@aws-sdk/cloudfront-signer';

import { env } from '$env/dynamic/private';

export { type CloudfrontSignedCookiesOutput } from '@aws-sdk/cloudfront-signer';

const { CLOUDFRONT_KEY_PAIR_ID, CLOUDFRONT_PRIVATE_KEY } = env;

/**
 * Generates CloudFront signed cookies scoped to `/videos/*` on the app domain.
 * The caller is responsible for passing a TTL that matches the desired lifetime
 * (typically the authenticated session's sliding window).
 *
 * Uses a custom policy (not a canned policy) because canned policies do not
 * support wildcard resources — CloudFront rebuilds the canned policy at verify
 * time using the concrete request URL, so a wildcard Resource would never match.
 *
 * @param ttlSeconds - How long the signed cookies should remain valid, in seconds.
 */
export const getCloudFrontSignedCookies = (
  ttlSeconds: number,
): CloudfrontSignedCookiesOutput | null => {
  if (!CLOUDFRONT_KEY_PAIR_ID || !CLOUDFRONT_PRIVATE_KEY) {
    return null;
  }

  const expiresEpoch = Math.floor(Date.now() / 1000) + ttlSeconds;

  const policy = JSON.stringify({
    Statement: [
      {
        Resource: `${env.APP_URL}/videos/*`,
        Condition: {
          DateLessThan: {
            'AWS:EpochTime': expiresEpoch,
          },
        },
      },
    ],
  });

  return getSignedCookies({
    policy,
    keyPairId: CLOUDFRONT_KEY_PAIR_ID,
    privateKey: CLOUDFRONT_PRIVATE_KEY,
  });
};
