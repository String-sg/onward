import { json, type RequestHandler } from '@sveltejs/kit';

import { db } from '$lib/server/db.js';
import { logger } from '$lib/server/logger.js';

interface MessageParams {
  role: 'USER';
  content: string;
}

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const params: MessageParams = await request.json();
    if (
      !params ||
      typeof params !== 'object' ||
      params.role !== 'USER' ||
      typeof params.content !== 'string'
    ) {
      return json({ error: 'Invalid request body' }, { status: 400 });
    }

    if (!params.content || params.content.length === 0) {
      return json({ error: 'content is required' }, { status: 400 });
    }

    const userIdRaw = locals.session?.user?.id;
    const userId = typeof userIdRaw === 'string' ? BigInt(userIdRaw) : userIdRaw;
    if (!userId) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const thread = await db.$transaction(async (tx) => {
      let thread = await tx.thread.findFirst({
        where: { userId: userId, isActive: true },
        select: { id: true },
      });

      if (!thread) {
        thread = await tx.thread.create({
          data: { userId: userId, isActive: true },
          select: { id: true },
        });
      }

      await tx.message.create({
        data: {
          threadId: thread.id,
          role: 'USER',
          content: params.content,
        },
      });

      return thread;
    });

    // RAG logic to generate assistant response would go here.
    const dummyAssistantMessage = await db.message.create({
      data: {
        threadId: thread.id,
        role: 'ASSISTANT',
        content: "Hello! I'm an AI assistant. How can I help you today?",
      },
      select: { role: true, content: true },
    });

    return json(dummyAssistantMessage, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorName = error instanceof Error ? error.constructor.name : 'UnknownError';

    logger.error(`${errorName} - ${errorMessage}`);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
