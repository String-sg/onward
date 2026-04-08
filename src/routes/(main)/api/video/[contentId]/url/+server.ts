import { json } from '@sveltejs/kit';
import { validate as uuidValidate } from 'uuid';

import {
  db,
  type LearningUnitContentFindUniqueArgs,
  type LearningUnitContentGetPayload,
  LearningUnitStatus,
} from '$lib/server/db.js';
import { getVideoPresignedUrl } from '$lib/server/s3.js';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
  const logger = event.locals.logger.child({ handler: 'api_get_video_url' });

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User not authenticated');
    return json(null, { status: 401 });
  }

  const { contentId } = event.params;
  if (typeof contentId !== 'string' || !uuidValidate(contentId)) {
    return json({ error: 'Invalid content ID' }, { status: 400 });
  }

  const contentArgs = {
    select: { url: true },
    where: {
      id: contentId,
      learningUnit: { status: LearningUnitStatus.PUBLISHED },
    },
  } satisfies LearningUnitContentFindUniqueArgs;

  let content: LearningUnitContentGetPayload<typeof contentArgs> | null;
  try {
    content = await db.learningUnitContent.findUnique(contentArgs);
  } catch (err) {
    logger.error({ err }, 'Failed to retrieve learning unit content');
    return json(null, { status: 500 });
  }

  if (!content || !content.url) {
    return json({ error: 'Content not found' }, { status: 404 });
  }

  let presignedUrl: string;
  try {
    presignedUrl = await getVideoPresignedUrl(content.url);
  } catch (err) {
    logger.error({ err }, 'Failed to generate presigned URL');
    return json(null, { status: 500 });
  }

  return json({ url: presignedUrl }, { headers: { 'Cache-Control': 'no-store' } });
};
