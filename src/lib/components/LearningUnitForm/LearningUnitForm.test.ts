import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { LearningUnitForm } from './index.js';

const BASE_UNIT = {
  title: '',
  contents: [],
  collectionId: '',
  summary: '',
  objectives: '',
  createdBy: '',
  selectedTagId: '',
  isRecommended: false,
  isRequired: false,
  dueDate: '',
  sources: [],
  questionAnswers: [],
};

const BASE_DATA = {
  collections: [],
  contentTags: [],
  sourceTags: [],
  contentTypes: ['PODCAST', 'VIDEO'],
};

describe('LearningUnitForm - content items', () => {
  test('renders "Add content item" button', () => {
    render(LearningUnitForm, {
      props: { unit: BASE_UNIT, data: BASE_DATA, form: null, onsubmit: vi.fn() },
    });
    expect(screen.getByRole('button', { name: /add content item/i })).toBeInTheDocument();
  });

  test('adds a content item when "Add content item" is clicked', async () => {
    const user = userEvent.setup();
    render(LearningUnitForm, {
      props: {
        unit: { ...BASE_UNIT, contents: [] },
        data: BASE_DATA,
        form: null,
        onsubmit: vi.fn(),
      },
    });

    await user.click(screen.getByRole('button', { name: /add content item/i }));
    // After clicking, a type selector should appear (may be multiple comboboxes in the form)
    expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0);
  });

  test('shows URL input for PODCAST type', async () => {
    render(LearningUnitForm, {
      props: {
        unit: { ...BASE_UNIT, contents: [{ type: 'PODCAST', url: '' }] },
        data: BASE_DATA,
        form: null,
        onsubmit: vi.fn(),
      },
    });
    expect(screen.getByPlaceholderText(/podcast url/i)).toBeInTheDocument();
  });

  test('shows URL input for VIDEO type', () => {
    render(LearningUnitForm, {
      props: {
        unit: { ...BASE_UNIT, contents: [{ type: 'VIDEO', url: '' }] },
        data: BASE_DATA,
        form: null,
        onsubmit: vi.fn(),
      },
    });
    expect(screen.getByPlaceholderText('https://...')).toBeInTheDocument();
  });

  test('removes a content item when Remove is clicked', async () => {
    const user = userEvent.setup();
    render(LearningUnitForm, {
      props: {
        unit: { ...BASE_UNIT, contents: [{ type: 'PODCAST', url: 'https://example.com' }] },
        data: BASE_DATA,
        form: null,
        onsubmit: vi.fn(),
      },
    });

    await user.click(screen.getByRole('button', { name: /remove/i }));
    expect(screen.queryByPlaceholderText(/podcast url/i)).not.toBeInTheDocument();
  });
});
