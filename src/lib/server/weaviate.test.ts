import { describe, expect, test, vi } from 'vitest';

const { mockHybrid } = vi.hoisted(() => ({ mockHybrid: vi.fn() }));

vi.mock('$app/environment', () => ({ building: true }));
vi.mock('$env/dynamic/private', () => ({ env: {} }));

vi.mock('weaviate-client', () => ({
  default: {
    connectToCustom: vi.fn(async () => ({
      collections: { get: () => ({ query: { hybrid: mockHybrid } }) },
      close: vi.fn(),
    })),
    ApiKey: vi.fn(),
  },
}));

import { search } from './weaviate.js';

describe('search', () => {
  test('requests hybrid search and returns the matched learning units', async () => {
    mockHybrid.mockResolvedValueOnce({
      objects: [
        { properties: { learning_unit_id: 'lu-1', content: 'a' } },
        { properties: { learning_unit_id: 'lu-2', content: 'b' } },
      ],
    });

    const result = await search('what is photosynthesis');

    expect(mockHybrid).toHaveBeenCalledWith('what is photosynthesis', {
      limit: 60,
      returnProperties: ['learning_unit_id', 'content'],
      alpha: 0.5,
      fusionType: 'RelativeScore',
      maxVectorDistance: 0.55,
      queryProperties: ['content'],
      targetVector: ['content_vector'],
    });
    expect(result).toEqual([
      { learning_unit_id: 'lu-1', content: 'a' },
      { learning_unit_id: 'lu-2', content: 'b' },
    ]);
  });
});
