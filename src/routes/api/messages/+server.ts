import { json, type RequestHandler } from '@sveltejs/kit';

import { db, type MessageFindManyArgs, type MessageGetPayload, Role } from '$lib/server/db.js';
import { DEVELOPER_MESSAGE, openAI } from '$lib/server/openai.js';
import { search } from '$lib/server/weaviate';

import type { JSONObject } from '../types';

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

  let result: string[];
  try {
    result = await search(query);
  } catch (err) {
    logger.error({ err, userId: user.id }, 'Failed to search for relevant content');
    return json(null, { status: 500 });
  }

  const messagesArgs = {
    select: { role: true, content: true },
    where: {
      thread: {
        userId: BigInt(user.id),
        isActive: true,
      },
    },
    orderBy: { createdAt: 'asc' },
  } satisfies MessageFindManyArgs;

  let history: MessageGetPayload<typeof messagesArgs>[] | null;
  try {
    history = await db.message.findMany(messagesArgs);
  } catch (err) {
    logger.error({ err, userId: user.id }, 'Failed to get chat history');
    return json(null, { status: 500 });
  }

  const completion = await openAI.chat.completions.create({
    model: 'gpt-5-nano',
    messages: [
      {
        role: 'developer',
        content: DEVELOPER_MESSAGE,
      },
      {
        role: 'developer',
        content:
          '# Context: \n\n' +
          (result.length === 0
            ? 'No relevant context found.'
            : `${result.map((cont) => `- ${cont}`).join('\n\n')}`),
      },
      ...history.map((msg) => ({
        role: msg.role.toLowerCase() as 'user' | 'assistant',
        content: msg.content,
      })),
      {
        role: 'user',
        content: query,
      },
    ],
    temperature: 0,
    stream: true,
  });

  const encoder = new TextEncoder();

  let fullAnswer = '';

  const answerStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of completion) {
          let errorMessage: { type: 'error'; message: string };

          if (!('choices' in chunk) || chunk.choices.length === 0 || !chunk.choices[0].delta) {
            logger.error({ chunk: chunk }, 'Invalid stream format');
            errorMessage = { type: 'error', message: 'Invalid stream format.' };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorMessage)}\n\n`));
            break;
          }

          if (chunk.choices[0].delta.refusal) {
            logger.warn(
              { refusal: chunk.choices[0].delta.refusal, userId: user.id },
              'Request refused by AI',
            );
            errorMessage = { type: 'error', message: 'Request refused by AI.' };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorMessage)}\n\n`));
            break;
          }

          if (chunk.choices[0].finish_reason) {
            if (chunk.choices[0].finish_reason === 'length') {
              logger.warn('Max number of tokens in request has been reached');
              errorMessage = { type: 'error', message: 'Max number of tokens has been reached.' };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorMessage)}\n\n`));
              break;
            }

            if (chunk.choices[0].finish_reason === 'content_filter') {
              logger.warn('Content is flagged');
              errorMessage = { type: 'error', message: 'Content is flagged.' };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorMessage)}\n\n`));
              break;
            }
          }

          if (chunk.choices[0].finish_reason === 'stop') {
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
                      content: query,
                    },
                    {
                      threadId: thread.id,
                      role: Role.ASSISTANT,
                      content: fullAnswer,
                    },
                  ],
                });
              });
            } catch (err) {
              logger.error({ err, userId: user.id }, 'Failed to create a message');
              return json(null, { status: 500 });
            }

            controller.enqueue(encoder.encode(`data: [DONE]\n\n`));

            break;
          }

          if (!chunk.choices[0].delta.content) {
            logger.warn('Content is missing');
            errorMessage = { type: 'error', message: 'Content is missing.' };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorMessage)}\n\n`));
            break;
          }

          fullAnswer += chunk.choices[0].delta.content;

          const chunkMessage: { type: 'chunk'; message: string } = {
            type: 'chunk',
            message: chunk.choices[0].delta.content,
          };

          controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunkMessage)}\n\n`));
        }
      } catch (err) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: err })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(answerStream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
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
