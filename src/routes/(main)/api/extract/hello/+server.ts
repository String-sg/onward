import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

import {
  composeMiddleware,
  withInternalApiKey,
  withIpWhitelist,
} from '$lib/server/middleware/index.js';

const helloApi: RequestHandler = async () => {
  return json({
    message: 'Hello, world!',
  });
};

export const GET: RequestHandler = composeMiddleware([withIpWhitelist, withInternalApiKey])(
  helloApi,
);
