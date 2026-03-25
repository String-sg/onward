import { describe, expect, test } from 'vitest';

import { validateLearningUnit, validateLearningUnitDraft } from './validation.js';

function makeFormData(fields: Record<string, string | string[]>): FormData {
  const fd = new FormData();
  for (const [key, val] of Object.entries(fields)) {
    if (Array.isArray(val)) {
      for (const v of val) fd.append(key, v);
    } else {
      fd.set(key, val);
    }
  }
  return fd;
}

const BASE_DRAFT = {
  title: 'Test Unit',
  summary: 'A summary',
  objectives: 'Learn stuff',
  createdBy: 'Author',
  collectionId: 'some-collection-id',
};

const BASE_PUBLISH = {
  ...BASE_DRAFT,
  tags: 'tag-id-1',
  sources: JSON.stringify([{ title: 'Src', sourceURL: 'https://example.com', tagId: 'tag-1' }]),
  questionAnswers: JSON.stringify([]),
};

describe('validateLearningUnitDraft - contentItems', () => {
  test('accepts VIDEO item with valid URL', () => {
    const fd = makeFormData({
      ...BASE_DRAFT,
      contentItems: JSON.stringify([{ type: 'VIDEO', url: 'https://example.com/video/123' }]),
    });
    const result = validateLearningUnitDraft(fd);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.contentItems[0].type).toBe('VIDEO');
      expect(result.data.contentItems[0].url).toBe('https://example.com/video/123');
    }
  });

  test('accepts PODCAST item with valid URL', () => {
    const fd = makeFormData({
      ...BASE_DRAFT,
      contentItems: JSON.stringify([{ type: 'PODCAST', url: 'https://example.com/audio.mp3' }]),
    });
    expect(validateLearningUnitDraft(fd).success).toBe(true);
  });

  test('accepts QUIZ item without URL', () => {
    const fd = makeFormData({
      ...BASE_DRAFT,
      contentItems: JSON.stringify([{ type: 'QUIZ', url: null }]),
    });
    const result = validateLearningUnitDraft(fd);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.contentItems[0].url).toBeNull();
    }
  });

  test('accepts empty contentItems in draft', () => {
    const fd = makeFormData({ ...BASE_DRAFT, contentItems: JSON.stringify([]) });
    expect(validateLearningUnitDraft(fd).success).toBe(true);
  });

  test('rejects VIDEO item with empty URL', () => {
    const fd = makeFormData({
      ...BASE_DRAFT,
      contentItems: JSON.stringify([{ type: 'VIDEO', url: '' }]),
    });
    expect(validateLearningUnitDraft(fd).success).toBe(false);
  });

  test('rejects invalid content type', () => {
    const fd = makeFormData({
      ...BASE_DRAFT,
      contentItems: JSON.stringify([{ type: 'PDF', url: 'https://example.com/file.pdf' }]),
    });
    expect(validateLearningUnitDraft(fd).success).toBe(false);
  });
});

describe('validateLearningUnit - contentItems', () => {
  test('requires at least one content item for publish', () => {
    const fd = makeFormData({ ...BASE_PUBLISH, contentItems: JSON.stringify([]) });
    const result = validateLearningUnit(fd);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.contentItems).toBeDefined();
    }
  });

  test('accepts VIDEO content item for publish', () => {
    const fd = makeFormData({
      ...BASE_PUBLISH,
      contentItems: JSON.stringify([{ type: 'VIDEO', url: 'https://example.com/video/987654321' }]),
    });
    expect(validateLearningUnit(fd).success).toBe(true);
  });

  test('rejects PODCAST item with invalid URL for publish', () => {
    const fd = makeFormData({
      ...BASE_PUBLISH,
      contentItems: JSON.stringify([{ type: 'PODCAST', url: 'not-a-url' }]),
    });
    expect(validateLearningUnit(fd).success).toBe(false);
  });

  test('accepts multiple content items', () => {
    const fd = makeFormData({
      ...BASE_PUBLISH,
      contentItems: JSON.stringify([
        { type: 'VIDEO', url: 'https://example.com/video/123' },
        { type: 'QUIZ', url: null },
      ]),
    });
    expect(validateLearningUnit(fd).success).toBe(true);
  });
});
