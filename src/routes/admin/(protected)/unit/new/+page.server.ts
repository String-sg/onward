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
import { validateLearningUnit, validateLearningUnitDraft } from '$lib/server/unit/validation.js';

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

  return { collections, contentTags, sourceTags };
};

export const actions = {
  saveDraft: async (event) => {
    if (!event.locals.session.user) {
      redirect(303, '/admin');
    }

    const logger = event.locals.logger.child({
      userID: event.locals.session.user.id,
      handler: 'action_create_draft_learning_unit',
    });

    const formData = await event.request.formData();
    const result = validateLearningUnitDraft(formData);

    if (!result.success) {
      return fail(400, { errors: result.errors });
    }

    const { data } = result;

    const createArgs = {
      data: {
        status: 'DRAFT' as const,
        title: data.title,
        contentType: data.contentType,
        contentURL: data.contentURL,
        summary: data.summary,
        objectives: data.objectives,
        createdBy: data.createdBy,
        collectionId: data.collectionId,
        isRecommended: data.isRecommended,
        isRequired: data.isRequired,
        dueDate: data.dueDate,
        tags:
          data.tagIds.length > 0 ? { create: data.tagIds.map((tagId) => ({ tagId })) } : undefined,
        sources:
          data.sources.length > 0
            ? {
                create: data.sources.map((s) => ({
                  title: s.title,
                  sourceURL: s.sourceURL,
                  tags: s.tagId ? { create: { tagId: s.tagId } } : undefined,
                })),
              }
            : undefined,
        questionAnswers:
          data.questionAnswers.length > 0
            ? {
                create: data.questionAnswers.map((q, i) => ({
                  question: q.question,
                  options: q.options,
                  answer: q.answer,
                  explanation: q.explanation,
                  order: i + 1,
                })),
              }
            : undefined,
      },
      select: { id: true },
    } satisfies LearningUnitCreateArgs;

    let newUnit: LearningUnitGetPayload<typeof createArgs>;
    try {
      newUnit = await db.learningUnit.create(createArgs);
    } catch (err) {
      logger.error({ err }, 'Failed to create draft learning unit');
      throw error(500);
    }

    logger.info({ learningUnitId: newUnit.id }, 'Draft learning unit created successfully');

    redirect(303, `/admin/unit/${newUnit.id}/edit`);
  },

  publish: async (event) => {
    if (!event.locals.session.user) {
      redirect(303, '/admin');
    }

    const logger = event.locals.logger.child({
      userID: event.locals.session.user.id,
      handler: 'action_create_publish_learning_unit',
    });

    const formData = await event.request.formData();
    const result = validateLearningUnit(formData);

    if (!result.success) {
      return fail(400, { errors: result.errors });
    }

    const { data } = result;

    const createArgs = {
      data: {
        status: 'PUBLISHED' as const,
        title: data.title,
        contentType: data.contentType,
        contentURL: data.contentURL,
        summary: data.summary,
        objectives: data.objectives,
        createdBy: data.createdBy,
        collectionId: data.collectionId,
        isRecommended: data.isRecommended,
        isRequired: data.isRequired,
        dueDate: data.dueDate,
        tags:
          data.tagIds.length > 0 ? { create: data.tagIds.map((tagId) => ({ tagId })) } : undefined,
        sources:
          data.sources.length > 0
            ? {
                create: data.sources.map((s) => ({
                  title: s.title,
                  sourceURL: s.sourceURL,
                  tags: s.tagId ? { create: { tagId: s.tagId } } : undefined,
                })),
              }
            : undefined,
        questionAnswers:
          data.questionAnswers.length > 0
            ? {
                create: data.questionAnswers.map((q, i) => ({
                  question: q.question,
                  options: q.options,
                  answer: q.answer,
                  explanation: q.explanation,
                  order: i + 1,
                })),
              }
            : undefined,
      },
      select: { id: true },
    } satisfies LearningUnitCreateArgs;

    let publishedUnit: LearningUnitGetPayload<typeof createArgs>;
    try {
      publishedUnit = await db.learningUnit.create(createArgs);
    } catch (err) {
      logger.error({ err }, 'Failed to publish learning unit');
      throw error(500);
    }

    logger.info({ learningUnitId: publishedUnit.id }, 'Learning unit published successfully');

    redirect(303, '/admin/dashboard');
  },
} satisfies Actions;
