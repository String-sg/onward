import type { RequestHandler } from '@sveltejs/kit';

import { google } from '$lib/server/google';

export const GET: RequestHandler = async ({ locals }) => {
  const authUrl = await google.createAuthUrl(locals.session);
  return new Response(null, { status: 302, headers: { location: authUrl } });
};
