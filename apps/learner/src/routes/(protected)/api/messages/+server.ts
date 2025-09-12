import { json, type RequestHandler } from '@sveltejs/kit';

import { db } from '$lib/server/db.js';

import { Role } from '../../../../generated/enums';

interface MessageParams {
  role: 'USER';
  content: string;
}

interface MessageResponse {
  role: Role;
  content: string;
}

interface MessagesResponse {
  messages: MessageResponse[];
}

export const GET: RequestHandler = async (event) => {
  const logger = event.locals.logger.child({ handler: 'get_messages' });
  const userIdRaw = event.locals.session?.user?.id;
  const userId = typeof userIdRaw === 'string' ? BigInt(userIdRaw) : userIdRaw;
  if (!userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const thread = await db.thread.findFirst({
      where: {
        userId: userId,
        isActive: true,
      },
      select: {
        messages: {
          orderBy: { createdAt: 'asc' },
          select: { role: true, content: true },
        },
      },
    });

    const response: MessagesResponse = { messages: thread?.messages || [] };

    return json(response, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorName = error instanceof Error ? error.constructor.name : 'UnknownError';

    logger.error(`${errorName} - ${errorMessage}`);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

export const POST: RequestHandler = async (event) => {
  const logger = event.locals.logger.child({ handler: 'post_messages' });
  const userIdRaw = event.locals.session?.user?.id;
  const userId = typeof userIdRaw === 'string' ? BigInt(userIdRaw) : userIdRaw;
  if (!userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params: MessageParams = await event.request.json();
  if (
    !params ||
    typeof params !== 'object' ||
    params.role !== Role.USER ||
    typeof params.content !== 'string'
  ) {
    return json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!params.content || params.content.trim().length === 0) {
    return json({ error: 'content is required' }, { status: 400 });
  }

  try {
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
          role: Role.USER,
          content: params.content,
        },
      });

      return thread;
    });

    const dummyAssistantMessage: MessageResponse = await db.message.create({
      data: {
        threadId: thread.id,
        role: Role.ASSISTANT,
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
