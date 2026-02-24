import { error, fail, redirect } from '@sveltejs/kit';

import {
  type CollectionFindManyArgs,
  type CollectionGetPayload,
  db,
  type LearningUnitFindUniqueArgs,
  type LearningUnitGetPayload,
  type LearningUnitUpdateArgs,
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
    handler: 'page_load_unit_edit',
  });

  const learningUnitArgs = {
    where: { id: event.params.id },
    include: {
      tags: { include: { tag: true } },
      sources: { include: { tags: { include: { tag: true } } } },
      questionAnswers: { orderBy: { order: 'asc' as const } },
      collection: true,
    },
  } satisfies LearningUnitFindUniqueArgs;

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

  let learningUnit: LearningUnitGetPayload<typeof learningUnitArgs> | null;
  let collections: CollectionGetPayload<typeof collectionArgs>[];
  let contentTags: TagGetPayload<typeof contentTagArgs>[];
  let sourceTags: TagGetPayload<typeof sourceTagArgs>[];

  try {
    [learningUnit, collections, contentTags, sourceTags] = await Promise.all([
      db.learningUnit.findUnique(learningUnitArgs),
      db.collection.findMany(collectionArgs),
      db.tag.findMany(contentTagArgs),
      db.tag.findMany(sourceTagArgs),
    ]);
  } catch (err) {
    logger.error({ err }, 'Failed to fetch learning unit and related data');
    throw error(500);
  }

  if (!learningUnit) {
    throw error(404, 'Learning unit not found');
  }

  return {
    learningUnit: {
      ...learningUnit,
      dueDate: learningUnit.dueDate?.toISOString().split('T')[0] ?? null,
      sources: learningUnit.sources.map((s) => ({
        title: s.title,
        sourceURL: s.sourceURL,
        tagId: s.tags[0]?.tagId ?? '',
      })),
      questionAnswers: learningUnit.questionAnswers.map((q) => ({
        question: q.question,
        options: [...q.options],
        answer: q.answer,
        explanation: q.explanation,
      })),
    },
    collections,
    contentTags,
    sourceTags,
  };
};

export const actions = {
  saveDraft: async (event) => {
    if (!event.locals.session.user) {
      redirect(303, '/admin');
    }

    const logger = event.locals.logger.child({
      userID: event.locals.session.user.id,
      handler: 'action_save_draft_learning_unit',
    });

    const formData = await event.request.formData();
    const result = validateLearningUnitDraft(formData);

    if (!result.success) {
      return fail(400, { errors: result.errors });
    }

    const { data } = result;

    const learningUnitArgs = {
      where: { id: event.params.id },
      data: {
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
        status: 'DRAFT' as const,
        tags: {
          deleteMany: {},
          create: data.tagIds.map((tagId) => ({ tagId })),
        },
        sources: {
          deleteMany: {},
          create: data.sources.map((s) => ({
            title: s.title,
            sourceURL: s.sourceURL,
            tags: s.tagId ? { create: { tagId: s.tagId } } : undefined,
          })),
        },
        questionAnswers: {
          deleteMany: {},
          create: data.questionAnswers.map((q, i) => ({
            question: q.question,
            options: q.options,
            answer: q.answer,
            explanation: q.explanation,
            order: i + 1,
          })),
        },
      },
      include: {
        tags: { include: { tag: true } },
        sources: { include: { tags: { include: { tag: true } } } },
        questionAnswers: { orderBy: { order: 'asc' as const } },
      },
    } satisfies LearningUnitUpdateArgs;

    let learningUnit: LearningUnitGetPayload<typeof learningUnitArgs>;
    try {
      learningUnit = await db.learningUnit.update(learningUnitArgs);
    } catch (err) {
      logger.error({ err }, 'Failed to save draft learning unit');
      throw error(500);
    }

    logger.info({ learningUnitId: event.params.id }, 'Draft learning unit saved successfully');

    return {
      learningUnit: {
        ...learningUnit,
        dueDate: learningUnit.dueDate ? learningUnit.dueDate.toISOString().split('T')[0] : null,
        sources: learningUnit.sources.map((s) => ({
          title: s.title,
          sourceURL: s.sourceURL,
          tagId: s.tags[0]?.tagId ?? '',
        })),
        questionAnswers: learningUnit.questionAnswers.map((q) => ({
          question: q.question,
          options: [...q.options],
          answer: q.answer,
          explanation: q.explanation,
        })),
      },
    };
  },

  publish: async (event) => {
    if (!event.locals.session.user) {
      redirect(303, '/admin');
    }

    const logger = event.locals.logger.child({
      userID: event.locals.session.user.id,
      handler: 'action_publish_learning_unit',
    });

    const formData = await event.request.formData();
    const result = validateLearningUnit(formData);

    if (!result.success) {
      return fail(400, { errors: result.errors });
    }

    const updateArgs = {
      where: { id: event.params.id },
      data: {
        title: result.data.title,
        contentType: result.data.contentType,
        contentURL: result.data.contentURL,
        summary: result.data.summary,
        objectives: result.data.objectives,
        createdBy: result.data.createdBy,
        collectionId: result.data.collectionId,
        isRecommended: result.data.isRecommended,
        isRequired: result.data.isRequired,
        dueDate: result.data.dueDate,
        status: 'PUBLISHED' as const,
        tags: {
          deleteMany: {},
          create: result.data.tagIds.map((tagId) => ({ tagId })),
        },
        sources: {
          deleteMany: {},
          create: result.data.sources.map((s) => ({
            title: s.title,
            sourceURL: s.sourceURL,
            tags: s.tagId ? { create: { tagId: s.tagId } } : undefined,
          })),
        },
        questionAnswers: {
          deleteMany: {},
          create: result.data.questionAnswers.map((q, i) => ({
            question: q.question,
            options: q.options,
            answer: q.answer,
            explanation: q.explanation,
            order: i + 1,
          })),
        },
      },
    } satisfies LearningUnitUpdateArgs;

    try {
      await db.learningUnit.update(updateArgs);
    } catch (err) {
      logger.error({ err }, 'Failed to publish learning unit');
      throw error(500);
    }

    logger.info({ learningUnitId: event.params.id }, 'Learning unit published successfully');

    redirect(303, '/admin/dashboard');
  },
} satisfies Actions;
