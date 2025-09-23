import { json, type RequestHandler } from '@sveltejs/kit';

import { db, Role } from '$lib/server/db.js';
import { getOpenAIResponse } from '$lib/server/openai.js';
import { weaviateSearch } from '$lib/server/weaviate';

type JSONPrimitive = string | number | boolean | null;
type JSONValue = JSONPrimitive | JSONValue[] | JSONObject;
type JSONObject = { [key in string]: JSONValue };

export const GET: RequestHandler = async (event) => {
  const logger = event.locals.logger.child({ handler: 'api_get_messages' });

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User is not authenticated');
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
    logger.error({ err, userId: user.id }, 'Unknown error occurred while retrieving messages');
    return json(null, { status: 500 });
  }
};

export const POST: RequestHandler = async (event) => {
  const logger = event.locals.logger.child({ handler: 'api_create_message' });

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User is not authenticated');
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
      !('content' in params) ||
      typeof params.content !== 'string'
    ) {
      return json(null, { status: 422 });
    }
  } catch (err) {
    logger.error({ err, userId: user.id }, 'Unknown error occurred while parsing request body');
    return json(null, { status: 400 });
  }

  const content = params['content'];

  let weaviateSearchResponse;
  try {
    weaviateSearchResponse = await weaviateSearch(content);
  } catch (err) {
    logger.error({ err, userId: user.id }, 'Unknown error occurred while searching Weaviate');
    return json(null, { status: 500 });
  }

  let chatHistory: { role: string; content: string }[];
  try {
    chatHistory = await db.message.findMany({
      where: {
        thread: {
          userId: BigInt(user.id),
          isActive: true,
        },
      },
      orderBy: { createdAt: 'asc' },
      select: { role: true, content: true },
    });
  } catch (err) {
    logger.error({ err, userId: user.id }, 'Unknown error occurred while gettng chat history');
    return json(null, { status: 500 });
  }

  let chatResponseContent: string | null;
  try {
    chatResponseContent = await getOpenAIResponse(
      content,
      chatHistory,
      weaviateSearchResponse.objects,
    );
  } catch (err) {
    logger.error({ err, userId: user.id }, 'Unknown error occurred while chatting with OpenAI');
    return json(null, { status: 500 });
  }
  if (!chatResponseContent) {
    logger.error({ userId: user.id }, 'OpenAI response is missing content');
    return json(null, { status: 500 });
  }

  try {
    await db.$transaction(async (tx) => {
      let thread = await tx.thread.findFirst({
        where: { userId: BigInt(user.id), isActive: true },
        select: { id: true },
      });

      if (!thread) {
        thread = await tx.thread.create({
          data: { userId: BigInt(user.id), isActive: true },
          select: { id: true },
        });
      }

      await tx.message.createMany({
        data: [
          {
            threadId: thread.id,
            role: Role.USER,
            content: content,
          },
          {
            threadId: thread.id,
            role: Role.ASSISTANT,
            content: chatResponseContent,
          },
        ],
      });
    });

    return json(
      {
        role: Role.ASSISTANT,
        content: chatResponseContent,
      },
      { status: 201 },
    );
  } catch (err) {
    logger.error({ err, userId: user.id }, 'Unknown error occurred while creating a message');
    return json(null, { status: 500 });
  }
};

export const DELETE: RequestHandler = async (event) => {
  const logger = event.locals.logger.child({ handler: 'api_delete_messages' });

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User is not authenticated');
    return json(null, { status: 401 });
  }

  try {
    await db.thread.updateMany({
      where: { userId: BigInt(user.id), isActive: true },
      data: { isActive: false },
    });

    return new Response(null, { status: 204 });
  } catch (err) {
    logger.error({ err, userId: user.id }, 'Unknown error occurred while updating threads');
    return json(null, { status: 500 });
  }
};
