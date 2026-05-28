import type { ChatCompletion, ChatCompletionChunk } from 'openai/resources/chat/completions.js';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { Role } from '../../generated/prisma/enums.js';

const {
  mockCreate,
  mockSearch,
  mockTransaction,
  mockThreadFindFirst,
  mockThreadCreate,
  mockMessageCreateMany,
} = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockSearch: vi.fn(),
  mockTransaction: vi.fn(),
  mockThreadFindFirst: vi.fn(),
  mockThreadCreate: vi.fn(),
  mockMessageCreateMany: vi.fn(),
}));

vi.mock('./openai.js', () => ({
  openAI: { chat: { completions: { create: mockCreate } } },
}));

vi.mock('./weaviate.js', () => ({ search: mockSearch }));

vi.mock('./db.js', () => ({
  db: {
    $transaction: mockTransaction,
  },
  Role: { USER: 'USER', ASSISTANT: 'ASSISTANT' },
}));

const silentLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
} as unknown as import('./logger.js').Logger;

const readAll = async (stream: ReadableStream<Uint8Array>): Promise<string[]> => {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  const events: string[] = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }
    events.push(decoder.decode(value));
  }
  return events;
};

const streamChunks = (parts: string[]): AsyncIterable<ChatCompletionChunk> => ({
  async *[Symbol.asyncIterator]() {
    for (const part of parts) {
      yield {
        choices: [{ delta: { content: part }, finish_reason: null }],
      } as unknown as ChatCompletionChunk;
    }
    yield {
      choices: [{ delta: {}, finish_reason: 'stop' }],
    } as unknown as ChatCompletionChunk;
  },
});

const structuredCompletion = (query: string): ChatCompletion =>
  ({
    choices: [
      {
        finish_reason: 'stop',
        message: { role: 'assistant', content: JSON.stringify({ query }) },
      },
    ],
  }) as unknown as ChatCompletion;

afterEach(() => {
  vi.clearAllMocks();
});

import {
  __test__,
  CONTEXTUALIZE_MESSAGE,
  CONTEXTUALIZE_SCHEMA,
  DEVELOPER_MESSAGE,
  REFUSAL_MESSAGE,
} from './ask-ai.js';

describe('REFUSAL_MESSAGE', () => {
  test('is the exact canned refusal string', () => {
    expect(REFUSAL_MESSAGE).toBe("It looks like I don't have enough information to answer that.");
  });
});

describe('DEVELOPER_MESSAGE', () => {
  test('interpolates the REFUSAL_MESSAGE constant', () => {
    expect(DEVELOPER_MESSAGE).toContain(REFUSAL_MESSAGE);
  });
});

describe('ask — first turn (no history)', () => {
  test('skips contextualization, searches the raw query, streams, and persists', async () => {
    mockCreate.mockResolvedValueOnce(streamChunks(['Photo', 'synthesis', ' is a process.']));
    mockSearch.mockResolvedValueOnce([
      { learning_unit_id: 'lu-1', content: 'Plants convert light to chemical energy.' },
    ]);
    mockTransaction.mockImplementation(async (cb: (tx: unknown) => Promise<void>) => {
      await cb({
        thread: { findFirst: mockThreadFindFirst, create: mockThreadCreate },
        message: { createMany: mockMessageCreateMany },
      });
    });
    mockThreadFindFirst.mockResolvedValueOnce({ id: 'thread-1' });

    const { ask } = await import('./ask-ai.js');
    const stream = ask({
      userId: 'user-1',
      query: 'What is photosynthesis?',
      history: [],
      logger: silentLogger,
    });
    const events = await readAll(stream);

    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockSearch).toHaveBeenCalledWith('What is photosynthesis?');
    expect(mockCreate).toHaveBeenNthCalledWith(1, {
      model: 'gpt-5-mini',
      reasoning_effort: 'low',
      verbosity: 'low',
      stream: true,
      messages: [
        { role: 'developer', content: DEVELOPER_MESSAGE },
        { role: 'user', content: 'What is photosynthesis?' },
        {
          role: 'developer',
          content: '## Retrieved learning content\n\n- Plants convert light to chemical energy.',
        },
      ],
    });
    expect(events).toEqual([
      'data: {"type":"chunk","message":"Photo"}\n\n',
      'data: {"type":"chunk","message":"synthesis"}\n\n',
      'data: {"type":"chunk","message":" is a process."}\n\n',
      'data: [DONE]\n\n',
    ]);
    expect(mockMessageCreateMany).toHaveBeenCalledWith({
      data: [
        { threadId: 'thread-1', role: Role.USER, content: 'What is photosynthesis?' },
        { threadId: 'thread-1', role: Role.ASSISTANT, content: 'Photosynthesis is a process.' },
      ],
    });
  });
});

describe('ask — follow-up turn (with history)', () => {
  test('contextualizes, searches the standalone query, and generates with history + context', async () => {
    mockCreate
      .mockResolvedValueOnce(structuredCompletion('why does Bob attend the meeting'))
      .mockResolvedValueOnce(streamChunks(['Because', ' he was invited.']));
    mockSearch.mockResolvedValueOnce([{ learning_unit_id: 'lu-1', content: 'Bob was invited.' }]);
    mockTransaction.mockImplementation(async (cb: (tx: unknown) => Promise<void>) => {
      await cb({
        thread: { findFirst: mockThreadFindFirst, create: mockThreadCreate },
        message: { createMany: mockMessageCreateMany },
      });
    });
    mockThreadFindFirst.mockResolvedValueOnce({ id: 'thread-1' });

    const history = [
      { role: 'user' as const, content: 'Tell me about Bob' },
      { role: 'assistant' as const, content: 'Bob is a character.' },
    ];
    const { ask } = await import('./ask-ai.js');
    const stream = ask({
      userId: 'user-1',
      query: 'why is he there?',
      history,
      logger: silentLogger,
    });
    const events = await readAll(stream);

    expect(mockCreate).toHaveBeenNthCalledWith(1, {
      model: 'gpt-5-nano',
      reasoning_effort: 'minimal',
      response_format: CONTEXTUALIZE_SCHEMA,
      messages: [
        { role: 'developer', content: CONTEXTUALIZE_MESSAGE },
        { role: 'user', content: 'Tell me about Bob' },
        { role: 'assistant', content: 'Bob is a character.' },
        { role: 'user', content: 'why is he there?' },
      ],
    });
    expect(mockSearch).toHaveBeenCalledWith('why does Bob attend the meeting');
    expect(mockCreate).toHaveBeenNthCalledWith(2, {
      model: 'gpt-5-mini',
      reasoning_effort: 'low',
      verbosity: 'low',
      stream: true,
      messages: [
        { role: 'developer', content: DEVELOPER_MESSAGE },
        { role: 'user', content: 'Tell me about Bob' },
        { role: 'assistant', content: 'Bob is a character.' },
        { role: 'user', content: 'why is he there?' },
        { role: 'developer', content: '## Retrieved learning content\n\n- Bob was invited.' },
      ],
    });
    expect(events).toContainEqual('data: [DONE]\n\n');
    expect(mockMessageCreateMany).toHaveBeenCalledWith({
      data: [
        { threadId: 'thread-1', role: Role.USER, content: 'why is he there?' },
        { threadId: 'thread-1', role: Role.ASSISTANT, content: 'Because he was invited.' },
      ],
    });
  });
});

describe('ask — contextualization content_filter', () => {
  test('emits SSE error, does not search or persist', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ finish_reason: 'content_filter', message: { role: 'assistant', content: null } }],
    });

    const { ask } = await import('./ask-ai.js');
    const stream = ask({
      userId: 'u',
      query: 'why is he there?',
      history: [{ role: 'user', content: 'earlier' }],
      logger: silentLogger,
    });
    const events = await readAll(stream);

    expect(events).toEqual([
      `data: ${JSON.stringify({ type: 'error', message: 'Content flagged' })}\n\n`,
    ]);
    expect(mockSearch).not.toHaveBeenCalled();
    expect(mockTransaction).not.toHaveBeenCalled();
  });
});

describe('ask — contextualization fallback', () => {
  test('falls back to the raw query when contextualization throws, then answers', async () => {
    mockCreate
      .mockRejectedValueOnce(new Error('nano down'))
      .mockResolvedValueOnce(streamChunks(['answer']));
    mockSearch.mockResolvedValueOnce([{ learning_unit_id: 'lu-1', content: 'hit' }]);
    mockTransaction.mockImplementation(async (cb: (tx: unknown) => Promise<void>) => {
      await cb({
        thread: { findFirst: mockThreadFindFirst, create: mockThreadCreate },
        message: { createMany: mockMessageCreateMany },
      });
    });
    mockThreadFindFirst.mockResolvedValueOnce({ id: 'thread-1' });

    const { ask } = await import('./ask-ai.js');
    const stream = ask({
      userId: 'u',
      query: 'why is he there?',
      history: [{ role: 'user', content: 'earlier' }],
      logger: silentLogger,
    });
    const events = await readAll(stream);

    expect(mockSearch).toHaveBeenCalledWith('why is he there?');
    expect(events).toContainEqual('data: [DONE]\n\n');
  });
});

describe('ask — gate and retrieval', () => {
  test('zero hits triggers the gate: emits REFUSAL_MESSAGE, persists refusal, no generate call', async () => {
    mockSearch.mockResolvedValueOnce([]);
    mockTransaction.mockImplementation(async (cb: (tx: unknown) => Promise<void>) => {
      await cb({
        thread: { findFirst: mockThreadFindFirst, create: mockThreadCreate },
        message: { createMany: mockMessageCreateMany },
      });
    });
    mockThreadFindFirst.mockResolvedValueOnce({ id: 'thread-1' });

    const { ask, REFUSAL_MESSAGE } = await import('./ask-ai.js');
    const stream = ask({ userId: 'u', query: 'q', history: [], logger: silentLogger });
    const events = await readAll(stream);

    expect(mockCreate).not.toHaveBeenCalled();
    expect(events).toEqual([
      `data: ${JSON.stringify({ type: 'chunk', message: REFUSAL_MESSAGE })}\n\n`,
      'data: [DONE]\n\n',
    ]);
    expect(mockMessageCreateMany).toHaveBeenCalledWith({
      data: [
        { threadId: 'thread-1', role: Role.USER, content: 'q' },
        { threadId: 'thread-1', role: Role.ASSISTANT, content: REFUSAL_MESSAGE },
      ],
    });
  });

  test('search() throws: emits SSE error, does not persist', async () => {
    mockSearch.mockRejectedValueOnce(new Error('weaviate timeout'));

    const { ask } = await import('./ask-ai.js');
    const stream = ask({ userId: 'u', query: 'q', history: [], logger: silentLogger });
    const events = await readAll(stream);

    expect(mockCreate).not.toHaveBeenCalled();
    expect(events).toEqual([
      `data: ${JSON.stringify({ type: 'error', message: 'Service error' })}\n\n`,
    ]);
    expect(mockTransaction).not.toHaveBeenCalled();
  });
});

const streamWithFinish = (
  parts: string[],
  finishReason: string,
): AsyncIterable<ChatCompletionChunk> => ({
  async *[Symbol.asyncIterator]() {
    for (const part of parts) {
      yield {
        choices: [{ delta: { content: part }, finish_reason: null }],
      } as unknown as ChatCompletionChunk;
    }
    yield {
      choices: [{ delta: {}, finish_reason: finishReason }],
    } as unknown as ChatCompletionChunk;
  },
});

const streamWithRefusal = (): AsyncIterable<ChatCompletionChunk> => ({
  async *[Symbol.asyncIterator]() {
    yield {
      choices: [{ delta: { refusal: 'I cannot answer that.' }, finish_reason: null }],
    } as unknown as ChatCompletionChunk;
  },
});

const streamThatThrows = (): AsyncIterable<ChatCompletionChunk> => ({
  async *[Symbol.asyncIterator]() {
    yield {
      choices: [{ delta: { content: 'partial' }, finish_reason: null }],
    } as unknown as ChatCompletionChunk;
    throw new Error('stream interrupted');
  },
});

describe('ask — call #2 error branches', () => {
  test('finish_reason: length emits SSE error and skips persistence', async () => {
    mockCreate.mockResolvedValueOnce(streamWithFinish(['half'], 'length'));
    mockSearch.mockResolvedValueOnce([{ learning_unit_id: 'lu-1', content: 'hit' }]);

    const { ask } = await import('./ask-ai.js');
    const stream = ask({ userId: 'u', query: 'q', history: [], logger: silentLogger });
    const events = await readAll(stream);

    expect(events).toContainEqual(
      `data: ${JSON.stringify({ type: 'chunk', message: 'half' })}\n\n`,
    );
    expect(events).toContainEqual(
      `data: ${JSON.stringify({ type: 'error', message: 'Max tokens reached' })}\n\n`,
    );
    expect(events).not.toContain('data: [DONE]\n\n');
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  test('finish_reason: content_filter emits SSE error and skips persistence', async () => {
    mockCreate.mockResolvedValueOnce(streamWithFinish([], 'content_filter'));
    mockSearch.mockResolvedValueOnce([{ learning_unit_id: 'lu-1', content: 'hit' }]);

    const { ask } = await import('./ask-ai.js');
    const stream = ask({ userId: 'u', query: 'q', history: [], logger: silentLogger });
    const events = await readAll(stream);

    expect(events).toContainEqual(
      `data: ${JSON.stringify({ type: 'error', message: 'Content flagged' })}\n\n`,
    );
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  test('delta.refusal emits SSE error and skips persistence', async () => {
    mockCreate.mockResolvedValueOnce(streamWithRefusal());
    mockSearch.mockResolvedValueOnce([{ learning_unit_id: 'lu-1', content: 'hit' }]);

    const { ask } = await import('./ask-ai.js');
    const stream = ask({ userId: 'u', query: 'q', history: [], logger: silentLogger });
    const events = await readAll(stream);

    expect(events).toContainEqual(
      `data: ${JSON.stringify({ type: 'error', message: 'Request refused' })}\n\n`,
    );
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  test('mid-stream throw emits SSE error and skips persistence', async () => {
    mockCreate.mockResolvedValueOnce(streamThatThrows());
    mockSearch.mockResolvedValueOnce([{ learning_unit_id: 'lu-1', content: 'hit' }]);

    const { ask } = await import('./ask-ai.js');
    const stream = ask({ userId: 'u', query: 'q', history: [], logger: silentLogger });
    const events = await readAll(stream);

    expect(events).toContainEqual(
      `data: ${JSON.stringify({ type: 'chunk', message: 'partial' })}\n\n`,
    );
    expect(events).toContainEqual(
      `data: ${JSON.stringify({ type: 'error', message: 'Service error' })}\n\n`,
    );
    expect(mockTransaction).not.toHaveBeenCalled();
  });
});

describe('ask — persistence: thread lookup/create', () => {
  test('creates a new thread when none is active', async () => {
    mockCreate.mockResolvedValueOnce(streamChunks(['answer']));
    mockSearch.mockResolvedValueOnce([{ learning_unit_id: 'lu-1', content: 'hit' }]);
    mockTransaction.mockImplementation(async (cb: (tx: unknown) => Promise<void>) => {
      await cb({
        thread: { findFirst: mockThreadFindFirst, create: mockThreadCreate },
        message: { createMany: mockMessageCreateMany },
      });
    });
    mockThreadFindFirst.mockResolvedValueOnce(null);
    mockThreadCreate.mockResolvedValueOnce({ id: 'new-thread' });

    const { ask } = await import('./ask-ai.js');
    const stream = ask({ userId: 'u', query: 'q', history: [], logger: silentLogger });
    await readAll(stream);

    expect(mockThreadCreate).toHaveBeenCalledWith({
      data: { userId: 'u', isActive: true },
      select: { id: true },
    });
    expect(mockMessageCreateMany).toHaveBeenCalledWith({
      data: [
        { threadId: 'new-thread', role: Role.USER, content: 'q' },
        { threadId: 'new-thread', role: Role.ASSISTANT, content: 'answer' },
      ],
    });
  });

  test('reuses the active thread when one exists', async () => {
    mockCreate.mockResolvedValueOnce(streamChunks(['answer']));
    mockSearch.mockResolvedValueOnce([{ learning_unit_id: 'lu-1', content: 'hit' }]);
    mockTransaction.mockImplementation(async (cb: (tx: unknown) => Promise<void>) => {
      await cb({
        thread: { findFirst: mockThreadFindFirst, create: mockThreadCreate },
        message: { createMany: mockMessageCreateMany },
      });
    });
    mockThreadFindFirst.mockResolvedValueOnce({ id: 'existing-thread' });

    const { ask } = await import('./ask-ai.js');
    const stream = ask({ userId: 'u', query: 'q', history: [], logger: silentLogger });
    await readAll(stream);

    expect(mockThreadCreate).not.toHaveBeenCalled();
    expect(mockMessageCreateMany).toHaveBeenCalledWith({
      data: [
        { threadId: 'existing-thread', role: Role.USER, content: 'q' },
        { threadId: 'existing-thread', role: Role.ASSISTANT, content: 'answer' },
      ],
    });
  });
});

describe('ask — persistence failure', () => {
  test('success-path transaction failure: emits [DONE], logs error, no rethrow', async () => {
    mockCreate.mockResolvedValueOnce(streamChunks(['answer']));
    mockSearch.mockResolvedValueOnce([{ learning_unit_id: 'lu-1', content: 'hit' }]);
    mockTransaction.mockRejectedValueOnce(new Error('db down'));

    const { ask } = await import('./ask-ai.js');
    const stream = ask({ userId: 'u', query: 'q', history: [], logger: silentLogger });
    const events = await readAll(stream);

    expect(events).toContainEqual('data: [DONE]\n\n');
    expect(silentLogger.error).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'u' }),
      'Failed to persist messages',
    );
  });

  test('refusal-path transaction failure: logs error, no rethrow', async () => {
    mockSearch.mockResolvedValueOnce([]);
    mockTransaction.mockRejectedValueOnce(new Error('db down'));

    const { ask, REFUSAL_MESSAGE } = await import('./ask-ai.js');
    const stream = ask({ userId: 'u', query: 'q', history: [], logger: silentLogger });
    const events = await readAll(stream);

    expect(events).toContainEqual(
      `data: ${JSON.stringify({ type: 'chunk', message: REFUSAL_MESSAGE })}\n\n`,
    );
    expect(events).toContainEqual('data: [DONE]\n\n');
    expect(silentLogger.error).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'u' }),
      'Failed to persist messages',
    );
  });
});

describe('CONTEXTUALIZE_SCHEMA', () => {
  test('is a strict json_schema with a single required query string', () => {
    expect(CONTEXTUALIZE_SCHEMA.type).toBe('json_schema');
    expect(CONTEXTUALIZE_SCHEMA.json_schema.name).toBe('standalone_query');
    expect(CONTEXTUALIZE_SCHEMA.json_schema.strict).toBe(true);
    const schema = CONTEXTUALIZE_SCHEMA.json_schema.schema as {
      required: string[];
      properties: { query: { type: string } };
      additionalProperties: boolean;
    };
    expect(schema.required).toEqual(['query']);
    expect(schema.properties.query.type).toBe('string');
    expect(schema.additionalProperties).toBe(false);
  });
});

describe('parseContextualizedQuery', () => {
  test('returns the query when content is valid JSON with a string query', () => {
    const completion = structuredCompletion('why does Bob attend the meeting');

    const result = __test__.parseContextualizedQuery(completion);

    expect(result).toBe('why does Bob attend the meeting');
  });

  test('returns null when content is not a string', () => {
    const completion = {
      choices: [{ finish_reason: 'stop', message: { role: 'assistant', content: null } }],
    } as unknown as ChatCompletion;

    const result = __test__.parseContextualizedQuery(completion);

    expect(result).toBeNull();
  });

  test('returns null when content is not valid JSON', () => {
    const completion = {
      choices: [{ finish_reason: 'stop', message: { role: 'assistant', content: '{ broken' } }],
    } as unknown as ChatCompletion;

    const result = __test__.parseContextualizedQuery(completion);

    expect(result).toBeNull();
  });

  test('returns null when JSON has no string query field', () => {
    const completion = {
      choices: [{ finish_reason: 'stop', message: { role: 'assistant', content: '{"query":42}' } }],
    } as unknown as ChatCompletion;

    const result = __test__.parseContextualizedQuery(completion);

    expect(result).toBeNull();
  });
});

describe('contextualizeQuery', () => {
  test('first turn (empty history) returns the raw query and makes no OpenAI call', async () => {
    const result = await __test__.contextualizeQuery({
      history: [],
      query: 'What is photosynthesis?',
      userId: 'u',
      logger: silentLogger,
    });

    expect(result).toEqual({ query: 'What is photosynthesis?' });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  test('with history, returns the parsed standalone query and calls gpt-5-nano with the schema', async () => {
    mockCreate.mockResolvedValueOnce(structuredCompletion('why does Bob attend the meeting'));

    const result = await __test__.contextualizeQuery({
      history: [
        { role: 'user', content: 'Tell me about Bob' },
        { role: 'assistant', content: 'Bob is a character.' },
      ],
      query: 'why is he there?',
      userId: 'u',
      logger: silentLogger,
    });

    expect(result).toEqual({ query: 'why does Bob attend the meeting' });
    expect(mockCreate).toHaveBeenCalledWith({
      model: 'gpt-5-nano',
      reasoning_effort: 'minimal',
      response_format: CONTEXTUALIZE_SCHEMA,
      messages: [
        { role: 'developer', content: CONTEXTUALIZE_MESSAGE },
        { role: 'user', content: 'Tell me about Bob' },
        { role: 'assistant', content: 'Bob is a character.' },
        { role: 'user', content: 'why is he there?' },
      ],
    });
  });

  test('with history, falls back to the raw query when the call throws', async () => {
    mockCreate.mockRejectedValueOnce(new Error('nano down'));

    const result = await __test__.contextualizeQuery({
      history: [{ role: 'user', content: 'earlier' }],
      query: 'why is he there?',
      userId: 'u',
      logger: silentLogger,
    });

    expect(result).toEqual({ query: 'why is he there?' });
    expect(silentLogger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'u' }),
      'Contextualization failed, falling back to user query',
    );
  });

  test('with history, falls back to the raw query when content is malformed', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ finish_reason: 'stop', message: { role: 'assistant', content: '{ broken' } }],
    });

    const result = await __test__.contextualizeQuery({
      history: [{ role: 'user', content: 'earlier' }],
      query: 'why is he there?',
      userId: 'u',
      logger: silentLogger,
    });

    expect(result).toEqual({ query: 'why is he there?' });
    expect(silentLogger.warn).toHaveBeenCalledWith(
      { userId: 'u' },
      'Contextualization returned empty or malformed query, falling back to user query',
    );
  });

  test('with history, signals contentFiltered on finish_reason content_filter', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ finish_reason: 'content_filter', message: { role: 'assistant', content: null } }],
    });

    const result = await __test__.contextualizeQuery({
      history: [{ role: 'user', content: 'earlier' }],
      query: 'bad input',
      userId: 'u',
      logger: silentLogger,
    });

    expect(result).toEqual({ contentFiltered: true });
  });
});
