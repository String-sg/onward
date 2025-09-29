import { json, type RequestHandler } from '@sveltejs/kit';

import { type CompletionResponse, getAIProvider } from '$lib/server/ai';
import {
  db,
  type MessageFindManyArgs,
  type MessageGetPayload,
  Role,
  type ThreadFindFirstArgs,
  type ThreadGetPayload,
} from '$lib/server/db.js';
import { search } from '$lib/server/weaviate';

type JSONPrimitive = string | number | boolean | null;
type JSONValue = JSONPrimitive | JSONValue[] | JSONObject;
type JSONObject = { [key in string]: JSONValue };

export const GET: RequestHandler = async (event) => {
  const logger = event.locals.logger.child({ handler: 'api_get_messages' });

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User not authenticated');
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
    logger.error({ err, userId: user.id }, 'Failed to retrieve messages');
    return json(null, { status: 500 });
  }
};

export const POST: RequestHandler = async (event) => {
  const logger = event.locals.logger.child({ handler: 'api_create_message' });

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User not authenticated');
    return json(null, { status: 401 });
  }

  if (event.request.headers.get('content-type')?.split(';')[0] !== 'application/json') {
    return json(null, { status: 415 });
  }

  let params: JSONObject;
  try {
    params = await event.request.json();
    if (
      !params ||
      typeof params !== 'object' ||
      !('query' in params) ||
      typeof params['query'] !== 'string' ||
      params['query'].trim().length === 0
    ) {
      return json(null, { status: 422 });
    }
  } catch (err) {
    logger.error({ err, userId: user.id }, 'Failed to parse request body');
    return json(null, { status: 400 });
  }

  const ai = getAIProvider();

  const userQuery = {
    content: params['query'],
    tokenCount: ai.countToken(params['query']),
  };

  if (!ai.isWithinMaxEmbeddingInputTokens(userQuery.tokenCount)) {
    return json(null, { status: 413 });
  }

  let result: string[];
  try {
    result = await search(userQuery.content);
  } catch (err) {
    logger.error({ err, userId: user.id }, 'Failed to search for relevant content');
    return json(null, { status: 500 });
  }

  const threadArgs = {
    select: {
      id: true,
      totalTokens: true,
      messagesSkipped: true,
    },
    where: {
      userId: BigInt(user.id),
      isActive: true,
    },
  } satisfies ThreadFindFirstArgs;

  let thread: ThreadGetPayload<typeof threadArgs>;
  try {
    thread = await db.$transaction(async (tx) => {
      const thread = await tx.thread.findFirst(threadArgs);

      if (!thread) {
        return await tx.thread.create({
          data: {
            userId: BigInt(user.id),
            isActive: true,
          },
          select: {
            id: true,
            totalTokens: true,
            messagesSkipped: true,
          },
        });
      }

      return thread;
    });
  } catch (err) {
    logger.error({ err, userId: user.id }, 'Failed to create thread');
    return json(null, { status: 500 });
  }

  const messageArgs = {
    select: {
      role: true,
      content: true,
      tokenCount: true,
    },
    where: {
      threadId: thread.id,
    },
    orderBy: { createdAt: 'asc' },
    skip: thread.messagesSkipped,
  } satisfies MessageFindManyArgs;

  let history: MessageGetPayload<typeof messageArgs>[];
  try {
    history = await db.message.findMany(messageArgs);
  } catch (err) {
    logger.error({ err, userId: user.id }, 'Failed to get chat history');
    return json(null, { status: 500 });
  }

  let completions: CompletionResponse;
  try {
    completions = await ai.completions({
      query: userQuery,
      history,
      context: result,
      messagesToSkip: thread.messagesSkipped,
      totalHistoryTokens: thread.totalTokens,
    });
  } catch (err) {
    logger.error({ err, userId: user.id }, 'Failed to complete chat');
    return json(null, { status: 500 });
  }

  try {
    await Promise.all([
      db.message.createMany({
        data: [
          {
            threadId: thread.id,
            role: Role.USER,
            content: userQuery.content,
            tokenCount: userQuery.tokenCount,
          },
          {
            threadId: thread.id,
            role: Role.ASSISTANT,
            content: completions.answer,
            tokenCount: completions.tokenCount,
          },
        ],
      }),
      db.thread.update({
        where: { id: thread.id },
        data: {
          totalTokens: completions.totalHistoryTokens + completions.tokenCount,
          messagesSkipped: completions.messagesToSkip,
        },
      }),
    ]);

    return json(
      {
        role: Role.ASSISTANT,
        content: completions.answer,
      },
      { status: 201 },
    );
  } catch (err) {
    logger.error({ err, userId: user.id }, 'Failed to create a message');
    return json(null, { status: 500 });
  }
};

export const DELETE: RequestHandler = async (event) => {
  const logger = event.locals.logger.child({ handler: 'api_delete_messages' });

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User not authenticated');
    return json(null, { status: 401 });
  }

  try {
    await db.thread.updateMany({
      where: { userId: BigInt(user.id), isActive: true },
      data: { isActive: false },
    });

    return new Response(null, { status: 204 });
  } catch (err) {
    logger.error({ err, userId: user.id }, 'Failed to update threads');
    return json(null, { status: 500 });
  }
};
