import { error, fail, redirect } from '@sveltejs/kit';

import { nanoid } from '$lib/helpers/index.js';
import {
  type CollectionFindManyArgs,
  type CollectionGetPayload,
  db,
  type LearningUnitCreateInput,
  type TagFindManyArgs,
  type TagGetPayload,
} from '$lib/server/db.js';
import { validateLearningUnit } from '$lib/server/learning-units/learning-unit.form.js';
import { uploadPodcastObject } from '$lib/server/s3.js';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  if (!event.locals.session.user) {
    return error(401, 'Unauthorized');
  }

  const logger = event.locals.logger.child({
    scope: 'admin',
    userID: event.locals.session.user.id,
    handler: 'page_load_learning_unit_new',
  });

  const collectionArgs = {
    select: {
      id: true,
      title: true,
      type: true,
    },
    orderBy: {
      title: 'asc',
    },
  } satisfies CollectionFindManyArgs;

  const tagArgs = {
    select: {
      id: true,
      code: true,
      label: true,
    },
  } satisfies TagFindManyArgs;

  let collections: CollectionGetPayload<typeof collectionArgs>[];
  let tags: TagGetPayload<typeof tagArgs>[];

  try {
    [collections, tags] = await Promise.all([
      db.collection.findMany(collectionArgs),
      db.tag.findMany(tagArgs),
    ]);
  } catch (err) {
    logger.error({ err }, 'Failed to fetch collections and tags');

    throw error(500);
  }

  return {
    collections,
    tags,
  };
};

export const actions = {
  default: async (event) => {
    if (!event.locals.session.user) {
      return error(403);
    }

    const logger = event.locals.logger.child({
      scope: 'admin',
      user: event.locals.session.user.id,
      handler: 'action_create_learning_unit',
    });

    const formData = await event.request.formData();

    const result = validateLearningUnit(formData);
    if (!result.success) {
      return fail(400, { errors: result.errors });
    }

    let contentURL: string;
    try {
      contentURL = await uploadPodcastObject(result.data.podcastFile, nanoid());
      console.log('Uploaded podcast to URL:', contentURL);
    } catch (err) {
      logger.error({ err }, 'Podcast upload failed');

      return fail(500, { message: 'Internal server error' });
    }

    try {
      logger.info('Creating learning unit');

      const createData = {
        title: result.data.title,
        contentType: result.data.contentType,
        contentURL,
        summary: result.data.summary,
        objectives: result.data.objectives,
        createdBy: result.data.createdBy,
        collection: {
          connect: { id: result.data.collectionId },
        },
        isRecommended: result.data.isRecommended,
        isRequired: result.data.isRequired,
        dueDate: result.data.dueDate,
        tags: {
          create: result.data.tagIds.map((tagId) => ({
            tagId,
          })),
        },
        sources: {
          create: result.data.sources.map((source) => ({
            title: source.title,
            sourceURL: source.sourceURL,
            tags: source.tagId
              ? {
                  create: {
                    tagId: source.tagId,
                  },
                }
              : undefined,
          })),
        },
        questionAnswers: {
          create: result.data.questions.map((q, i) => ({
            question: q.question,
            options: q.options,
            answer: q.answer,
            explanation: q.explanation,
            order: i + 1,
          })),
        },
      } satisfies LearningUnitCreateInput;

      const learningUnit = await db.learningUnit.create({
        data: createData,
        select: { id: true },
      });

      logger.info({ learningUnitId: learningUnit.id }, 'Learning unit created successfully');
    } catch (err) {
      logger.error({ err }, 'Failed to create learning unit');

      const message =
        err instanceof Error
          ? `Failed to create learning unit: ${err.message}`
          : 'Failed to create learning unit. Please try again.';

      return fail(500, { message });
    }

    redirect(303, '/admin');
  },
} satisfies Actions;
