import { error, redirect } from '@sveltejs/kit';

import { type CollectionFindManyArgs, type CollectionGetPayload, db, type LearningUnitCreateArgs, type LearningUnitGetPayload, type TagFindManyArgs, type TagGetPayload } from '$lib/server/db.js';

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
      handler: 'action_create_empty_draft',
    });

    // Create empty draft — all content fields are nullable so no prefill needed
    const learningUnitCreateArgs = {
      data: {
        status: 'DRAFT' as const,
      },
      select: { id: true },
    } satisfies LearningUnitCreateArgs;

    let emptyDraft: LearningUnitGetPayload<typeof learningUnitCreateArgs>;
    try {
      emptyDraft = await db.learningUnit.create(learningUnitCreateArgs);
    } catch (err) {
      logger.error({ err }, 'Failed to create empty draft');
      throw error(500);
    }

    logger.info({ learningUnitId: emptyDraft.id }, 'Empty draft created successfully');

    // Redirect to edit page
    redirect(303, `/admin/unit/${emptyDraft.id}`);
  },
} satisfies Actions;
