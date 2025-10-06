import { json, type RequestHandler } from '@sveltejs/kit';

import {
  db,
  type DialogueFindFirstArgs,
  type DialogueGetPayload,
  type MessageFindManyArgs,
  type MessageGetPayload,
  Role,
  type ThreadFindFirstArgs,
  type ThreadGetPayload,
} from '$lib/server/db.js';
import {
  completions,
  getDeveloperMessageTokens,
  getTokenCount,
  MAX_CHAT_INPUT_TOKENS,
  MAX_EMBEDDING_INPUT_TOKENS,
} from '$lib/server/openai';
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

  const query = params['query'];
  const queryTokens = getTokenCount(query);

  if (queryTokens >= MAX_EMBEDDING_INPUT_TOKENS) {
    return json(null, { status: 413 });
  }

  let result: string[];
  try {
    result = await search(query);
  } catch (err) {
    logger.error(
      {
        err,
        userId: user.id,
        queryLength: query.length,
        queryTokens,
      },
      'Failed to search for relevant content',
    );
    return json(null, { status: 500 });
  }

  const context =
    'Context \n' +
    (result.length === 0
      ? 'No relevant context found.'
      : result.map((cont) => `- ${cont}`).join('\n\n'));
  const contextTokens = getTokenCount(context);

  // Retrieve message history within max input token limit.
  const threadArgs = {
    select: { id: true },
    where: {
      userId: BigInt(user.id),
      isActive: true,
    },
  } satisfies ThreadFindFirstArgs;

  let thread: ThreadGetPayload<typeof threadArgs> | null;
  try {
    thread = await db.thread.findFirst(threadArgs);

    if (!thread) {
      thread = await db.thread.create({
        data: {
          userId: BigInt(user.id),
          isActive: true,
        },
        select: { id: true },
      });
    }
  } catch (err) {
    logger.error({ err, userId: user.id }, 'Failed to create thread');
    return json(null, { status: 500 });
  }

  const lastDialogueArgs = {
    where: { threadId: thread.id },
    orderBy: { createdAt: 'desc' },
    select: { cumulativeTokens: true },
  } satisfies DialogueFindFirstArgs;

  let lastDialogue: DialogueGetPayload<typeof lastDialogueArgs> | null;
  try {
    lastDialogue = await db.dialogue.findFirst(lastDialogueArgs);
  } catch (error) {
    logger.error(
      {
        error,
        userId: user.id,
        threadID: thread.id,
      },
      'Failed to find dialogue',
    );
    return json(null, { status: 500 });
  }

  const tokenAllowance: number =
    MAX_CHAT_INPUT_TOKENS - (getDeveloperMessageTokens() + contextTokens + queryTokens);

  const messageSelectArgs = {
    select: {
      role: true,
      content: true,
    },
  } satisfies MessageFindManyArgs;

  let history: MessageGetPayload<typeof messageSelectArgs>[];
  if (lastDialogue && lastDialogue.cumulativeTokens > tokenAllowance) {
    const cutoffDialogueArgs = {
      select: {
        userMessageId: true,
        userMessage: {
          select: {
            createdAt: true,
          },
        },
      },
      where: {
        threadId: thread.id,
        cumulativeTokens: { gt: lastDialogue.cumulativeTokens - tokenAllowance },
      },
      orderBy: { createdAt: 'asc' },
    } satisfies DialogueFindFirstArgs;

    let cutoffDialogue: DialogueGetPayload<typeof cutoffDialogueArgs>;
    try {
      cutoffDialogue = await db.dialogue.findFirstOrThrow(cutoffDialogueArgs);
    } catch (error) {
      logger.error(
        {
          error,
          threadId: thread.id,
          tokenAllowance,
          cumulativeTokens: lastDialogue.cumulativeTokens,
        },
        'Failed to find cutoff dialogue',
      );
      return json(null, { status: 500 });
    }

    try {
      history = await db.message.findMany({
        ...messageSelectArgs,
        where: {
          threadId: thread.id,
          createdAt: { gte: cutoffDialogue.userMessage.createdAt },
        },
        orderBy: { createdAt: 'asc' },
      });
    } catch (err) {
      logger.error(
        {
          err,
          userId: user.id,
          threadID: thread.id,
          cutoffUserMessageCreatedAt: cutoffDialogue.userMessage.createdAt,
        },
        'Failed to retrieve message history',
      );
      return json(null, { status: 500 });
    }
  } else {
    history = await db.message.findMany({
      ...messageSelectArgs,
      where: {
        threadId: thread.id,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  let answer: string;
  try {
    answer = await completions({
      history,
      context,
      query,
    });
  } catch (err) {
    logger.error({ err, userId: user.id }, 'Failed to complete chat');
    return json(null, { status: 500 });
  }

  const answerTokens = getTokenCount(answer);

  try {
    await db.$transaction(async (tx) => {
      const [userMessage, assistantMessage] = await tx.message.createManyAndReturn({
        select: { id: true },
        data: [
          {
            threadId: thread.id,
            role: Role.USER,
            content: query,
            tokens: queryTokens,
          },
          {
            threadId: thread.id,
            role: Role.ASSISTANT,
            content: answer,
            tokens: answerTokens,
          },
        ],
      });

      const dialogueTokens = queryTokens + answerTokens;
      await tx.dialogue.create({
        data: {
          threadId: thread.id,
          userMessageId: userMessage.id,
          assistantMessageId: assistantMessage.id,
          tokens: dialogueTokens,
          cumulativeTokens: (lastDialogue?.cumulativeTokens || 0) + dialogueTokens,
        },
      });
    });
  } catch (err) {
    logger.error({ err, userId: user.id }, 'Failed to create a message');
    return json(null, { status: 500 });
  }

  return json(
    {
      role: Role.ASSISTANT,
      content: answer,
    },
    { status: 201 },
  );
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
