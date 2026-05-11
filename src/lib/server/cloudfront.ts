import { type CloudfrontSignedCookiesOutput, getSignedCookies } from '@aws-sdk/cloudfront-signer';

import { env } from '$env/dynamic/private';

export { type CloudfrontSignedCookiesOutput } from '@aws-sdk/cloudfront-signer';

const { CLOUDFRONT_KEY_PAIR_ID, CLOUDFRONT_PRIVATE_KEY } = env;

/**
 * Returns CloudFront signed cookies for protected resources, or `null` when
 * signing credentials are not configured.
 *
 * @param ttlSeconds - Cookie lifetime in seconds.
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
        Resource: `${env.APP_URL}/*`,
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
