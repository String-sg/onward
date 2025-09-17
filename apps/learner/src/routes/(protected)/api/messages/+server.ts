import { json, type RequestHandler } from '@sveltejs/kit';

import { db, Role } from '$lib/server/db.js';

interface MessageParams {
  role: Role;
  content: string;
}

export const GET: RequestHandler = async (event) => {
  const logger = event.locals.logger.child({ handler: 'api_get_messages' });

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User is not authenticated.');
    return json(null, { status: 401 });
  }

  try {
    const messages = await db.message.findMany({
      where: {
        thread: {
          userId: BigInt(user.id),
          isActive: true,
        },
      },
      orderBy: { createdAt: 'asc' },
      select: { role: true, content: true },
    });

    return json({ messages }, { status: 200 });
  } catch (err) {
    logger.error({ userId: user.id, err }, 'Unknown error occurred while retrieving messages.');
    return json(null, { status: 500 });
  }
};

export const POST: RequestHandler = async (event) => {
  const logger = event.locals.logger.child({ handler: 'api_create_message' });

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User is not authenticated.');
    return json(null, { status: 401 });
  }

  const userId = BigInt(user.id);

  const params: MessageParams = await event.request.json();
  if (
    !params ||
    typeof params !== 'object' ||
    params.role !== 'USER' ||
    typeof params.content !== 'string' ||
    params.content.trim().length === 0
  ) {
    return json(null, { status: 400 });
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

      await tx.message.createMany({
        data: [
          {
            threadId: thread.id,
            role: Role.USER,
            content: params.content.trim(),
          },
          {
            threadId: thread.id,
            role: Role.ASSISTANT,
            content: "Hello! I'm an AI assistant. How can I help you today?",
          },
        ],
      });

      return thread;
    });

    const dummyAssistantMessage = await db.message.create({
      data: {
        threadId: thread.id,
        role: 'ASSISTANT',
        content: "Hello! I'm an AI assistant. How can I help you today?",
      },
      select: { role: true, content: true },
    });

    return json(dummyAssistantMessage, { status: 201 });
  } catch (err) {
    logger.error({ userId, err}, 'Unknown error occurred while creating a message.');
    return json(null, { status: 500 });
  }
};

export const DELETE: RequestHandler = async (event) => {
  const logger = event.locals.logger.child({ handler: 'api_delete_thread' });

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User is not authenticated.');
    return json(null, { status: 401 });
  }

  try {
    await db.thread.updateMany({
      where: { userId: BigInt(user.id), isActive: true },
      data: { isActive: false },
    });

    return json(null, { status: 204 });
  } catch (err) {
    logger.error({ userId: user.id, err }, 'Unknown error occurred while deleting thread.');
    return json(null, { status: 500 });
  }
};
