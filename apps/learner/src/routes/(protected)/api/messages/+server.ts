import { json, type RequestHandler } from '@sveltejs/kit';

import { db } from '$lib/server/db.js';

import type { Role } from '../../../../generated/prisma/client';

interface MessageParams {
  role: Role;
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
  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User is not authenticated.');
    return json({ message: 'Redirect to /login' }, { status: 303 });
  }

  try {
    const thread = await db.thread.findFirst({
      where: {
        userId: BigInt(user.id),
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
  } catch (err) {
    logger
      .child({ userId: user.id })
      .error(err, 'Unknown error occurred while retrieving messages.');

    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

export const POST: RequestHandler = async (event) => {
  const logger = event.locals.logger.child({ handler: 'create_message' });
  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User is not authenticated.');
    return json({ message: 'Redirect to /login' }, { status: 303 });
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
          role: 'USER',
          content: params.content,
        },
      });

      return thread;
    });

    const dummyAssistantMessage: MessageResponse = await db.message.create({
      data: {
        threadId: thread.id,
        role: 'ASSISTANT',
        content: "Hello! I'm an AI assistant. How can I help you today?",
      },
      select: { role: true, content: true },
    });

    return json(dummyAssistantMessage, { status: 201 });
  } catch (err) {
    logger
      .child({ userId: user.id })
      .error(err, 'Unknown error occurred while creating a message.');

    return json({ err: 'Internal server error' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async (event) => {
  const logger = event.locals.logger.child({ handler: 'delete_thread' });
  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User is not authenticated.');
    return json({ message: 'Redirect to /login' }, { status: 303 });
  }

  try {
    await db.thread.updateMany({
      where: { userId: BigInt(user.id), isActive: true },
      data: { isActive: false },
    });

    return new Response(null, { status: 204 });
  } catch (err) {
    logger.child({ userId: user.id }).error(err, 'Unknown error occurred while deleting thread.');

    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
