import { type RequestHandler, text } from '@sveltejs/kit';

import { getPodcastObject, RangeNotSatisfiableError } from '$lib/server/s3.js';

const TEMPLATE = '<html><body><pre>%s</pre></body></html>';
const INVALID_REQUEST_BODY = TEMPLATE.replace('%s', 'Invalid request');
const REQUEST_RANGE_NOT_SATISFIED_BODY = TEMPLATE.replace('%s', 'Requested range not satisfiable');
const SOMETHING_WENT_WRONG_BODY = TEMPLATE.replace('%s', 'Something went wrong');

export const GET: RequestHandler = async (event) => {
  const logger = event.locals.logger.child({ handler: 'api_get_podcast' });

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User not authenticated');
    return text(INVALID_REQUEST_BODY, { status: 400 });
  }

  const range = event.request.headers.get('range');

  let podcast: Awaited<ReturnType<typeof getPodcastObject>> | null = null;
  try {
    podcast = await getPodcastObject(`podcasts/${event.params.key}`, { range });
    if (!podcast) {
      return text(INVALID_REQUEST_BODY, { status: 400 });
    }
  } catch (err) {
    if (err instanceof RangeNotSatisfiableError) {
      return text(REQUEST_RANGE_NOT_SATISFIED_BODY, { status: 416 });
    }

    logger.error({ err }, 'Failed to retrieve podcast');
    return text(SOMETHING_WENT_WRONG_BODY, { status: 500 });
  }

  const headers = new Headers({ 'Cache-Control': 'private, max-age=0, must-revalidate' });
  for (const [key, value] of Object.entries(podcast.headers)) {
    headers.set(key, value);
  }

  return new Response(podcast.stream, {
    status: range ? 206 : 200,
    headers,
  });
};
