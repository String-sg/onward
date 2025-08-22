import { GoogleOAuth } from '@onward/google-auth';

import { env } from '$env/dynamic/private';

import { valkey } from './valkey';

export const google = new GoogleOAuth({
  valkey,
  clientId: env.GOOGLE_CLIENT_ID,
  redirectUri: env.GOOGLE_REDIRECT_URI,
});
