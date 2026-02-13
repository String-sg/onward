import { error, fail, redirect } from '@sveltejs/kit';

import {
  type CollectionFindManyArgs,
  type CollectionGetPayload,
  db,
  type LearningUnitCreateArgs,
  type LearningUnitGetPayload,
  type TagFindManyArgs,
  type TagGetPayload,
} from '$lib/server/db.js';
import { validateLearningUnit } from '$lib/server/unit/form.js';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  if (!event.locals.session.user) {
    redirect(303, '/admin');
  }

  const logger = event.locals.logger.child({
    userID: event.locals.session.user.id,
    handler: 'page_load_unit_new',
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

  const tagBaseArgs = {
    select: {
      id: true,
      code: true,
      label: true,
    },
    orderBy: {
      label: 'asc',
    },
  } satisfies TagFindManyArgs;

  const contentTagArgs = {
    ...tagBaseArgs,
    where: { code: { notIn: ['PDF', 'LINK'] } },
  } satisfies TagFindManyArgs;

  const sourceTagArgs = {
    ...tagBaseArgs,
    where: { code: { in: ['PDF', 'LINK'] } },
  } satisfies TagFindManyArgs;

  let collections: CollectionGetPayload<typeof collectionArgs>[];
  let contentTags: TagGetPayload<typeof contentTagArgs>[];
  let sourceTags: TagGetPayload<typeof sourceTagArgs>[];
  try {
    [collections, contentTags, sourceTags] = await Promise.all([
      db.collection.findMany(collectionArgs),
      db.tag.findMany(contentTagArgs),
      db.tag.findMany(sourceTagArgs),
    ]);
  } catch (err) {
    logger.error({ err }, 'Failed to fetch collections and tags');
    throw error(500);
  }

  return {
    collections,
    contentTags,
    sourceTags,
  };
};

export const actions = {
  default: async (event) => {
    if (!event.locals.session.user) {
      redirect(303, '/admin');
    }

    const logger = event.locals.logger.child({
      userID: event.locals.session.user.id,
      handler: 'action_create_learning_unit',
    });

    const formData = await event.request.formData();
    const result = validateLearningUnit(formData);
    if (!result.success) {
      return fail(400, { errors: result.errors });
    }

    const learningUnitCreateArgs = {
      data: {
        title: result.data.title,
        contentType: result.data.contentType,
        contentURL: result.data.contentURL,
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
          create: result.data.questionAnswers.map((q, i) => ({
            question: q.question,
            options: q.options,
            answer: q.answer,
            explanation: q.explanation,
            order: i + 1,
          })),
        },
      },
      select: { id: true },
    } satisfies LearningUnitCreateArgs;

    let learningUnit: LearningUnitGetPayload<typeof learningUnitCreateArgs>;
    try {
      learningUnit = await db.learningUnit.create(learningUnitCreateArgs);
    } catch (err) {
      logger.error({ err }, 'Failed to create learning unit');
      throw error(500);
    }
    logger.info({ learningUnitId: learningUnit.id }, 'Learning unit created successfully');

    redirect(303, '/admin/dashboard');
  },
} satisfies Actions;
