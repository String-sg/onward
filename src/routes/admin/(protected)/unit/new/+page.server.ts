import { error, redirect } from '@sveltejs/kit';

import { db, type LearningUnitCreateArgs, type LearningUnitGetPayload } from '$lib/server/db.js';

import type { Actions } from './$types';

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
