import { json, type RequestHandler } from '@sveltejs/kit';

import { learnerAuth } from '$lib/server/auth';
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
          userId: user.id,
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

  if (event.request.headers.get('content-type')?.split(';')[0] !== 'application/json') {
    return json(null, { status: 415 });
  }

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User not authenticated');
    return json(null, { status: 401 });
  }

  const csrfToken = event.request.headers.get('x-csrf-token');
  if (!csrfToken || typeof csrfToken !== 'string') {
    logger.warn('CSRF token is missing');
    return json(null, { status: 400 });
  }

  const isValidCSRFToken = await learnerAuth.validateCSRFToken(event, csrfToken);
  if (!isValidCSRFToken) {
    logger.warn('CSRF token is invalid');
    return json(null, { status: 400 });
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
        userId: user.id,
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
          '**CONTEXT**: \n\n' +
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
    stream: true,
  });

  const encoder = new TextEncoder();

  let fullAnswer = '';

  const answerStream = new ReadableStream({
    async start(controller) {
      let event: {
        type: 'chunk' | 'error';
        message: string;
      };

      try {
        for await (const chunk of completion) {
          if (!('choices' in chunk) || chunk.choices.length === 0 || !chunk.choices[0].delta) {
            logger.error({ chunk: chunk }, 'Invalid stream format');

            event = { type: 'error', message: 'Invalid stream format.' };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));

            break;
          }

          if (chunk.choices[0].delta.refusal) {
            logger.warn(
              { refusal: chunk.choices[0].delta.refusal, userId: user.id },
              'Request refused by AI',
            );

            event = { type: 'error', message: 'Request refused by AI.' };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));

            break;
          }

          if (chunk.choices[0].finish_reason) {
            if (chunk.choices[0].finish_reason === 'length') {
              logger.warn('Max number of tokens in request has been reached');

              event = { type: 'error', message: 'Max number of tokens has been reached.' };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));

              break;
            }

            if (chunk.choices[0].finish_reason === 'content_filter') {
              logger.warn('Content is flagged');

              event = { type: 'error', message: 'Content is flagged.' };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));

              break;
            }
          }

          if (chunk.choices[0].finish_reason === 'stop') {
            try {
              await db.$transaction(async (tx) => {
                let thread = await tx.thread.findFirst({
                  where: { userId: user.id, isActive: true },
                  select: { id: true },
                });

                if (!thread) {
                  thread = await tx.thread.create({
                    data: { userId: user.id, isActive: true },
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

            event = { type: 'error', message: 'Content is missing.' };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));

            break;
          }

          fullAnswer += chunk.choices[0].delta.content;

          event = { type: 'chunk', message: chunk.choices[0].delta.content };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        }
      } catch (err) {
        logger.error({ err, userId: user.id }, 'Error in streaming response');

        event = {
          type: 'error',
          message: err instanceof Error ? err.message : 'Unknown error occurred',
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
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
      where: { userId: user.id, isActive: true },
      data: { isActive: false },
    });

    return new Response(null, { status: 204 });
  } catch (err) {
    logger.error({ err, userId: user.id }, 'Failed to update threads');
    return json(null, { status: 500 });
  }
};
