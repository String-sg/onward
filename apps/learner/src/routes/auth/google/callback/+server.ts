import type { RequestHandler } from '@sveltejs/kit';

import { google } from '$lib/server/google';

export const GET: RequestHandler = async ({ url, locals }) => {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  if (!code || !state) {
    return new Response('Invalid OAuth response', { status: 400 });
  }

  await google.handleCallback(locals.session, {
    code,
    state,
  });

  return new Response(null, { status: 302, headers: { location: '/' } });
};
