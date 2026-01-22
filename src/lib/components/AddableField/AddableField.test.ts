import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { createRawSnippet } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

import AddableField from './AddableField.svelte';

describe('AddableField', () => {
  const children = createRawSnippet<
    [{ id: number; name: string }, number, Record<string, string> | undefined]
  >((getItem, getIndex) => {
    const item = getItem();
    const index = getIndex();
    return {
      render: () => `<input type="text" value="${item.name}" data-testid="item-${index}" />`,
    };
  });

  it('renders the title', () => {
    render(AddableField<{ id: number; name: string }>, {
      props: {
        title: 'My Items',
        items: [],
        onadd: vi.fn(),
        onremove: vi.fn(),
        children,
      },
    });

    expect(screen.getByText('My Items')).toBeInTheDocument();
  });

  it('renders add button', () => {
    render(AddableField<{ id: number; name: string }>, {
      props: {
        title: 'Items',
        items: [],
        onadd: vi.fn(),
        onremove: vi.fn(),
        addButtonText: 'Add New Source',
        children,
      },
    });

    expect(screen.getByRole('button', { name: 'Add New Source' })).toBeInTheDocument();
  });

  it('shows empty message when no items', () => {
    render(AddableField<{ id: number; name: string }>, {
      props: {
        title: 'Items',
        items: [],
        onadd: vi.fn(),
        onremove: vi.fn(),
        emptyMessage: 'No sources available',
        children,
      },
    });

    expect(screen.getByText('No sources available')).toBeInTheDocument();
  });

  it('renders items when provided', () => {
    const mockItems = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
    ];

    render(AddableField<{ id: number; name: string }>, {
      props: {
        title: 'Items',
        items: mockItems,
        onadd: vi.fn(),
        onremove: vi.fn(),
        children,
      },
    });

    mockItems.forEach((_, idx) => {
      expect(screen.getByTestId(`item-${idx}`)).toBeInTheDocument();
    });
  });

  it('calls onadd when add button is clicked', async () => {
    const onadd = vi.fn();

    render(AddableField<{ id: number; name: string }>, {
      props: {
        title: 'Items',
        items: [],
        onadd,
        onremove: vi.fn(),
        children,
      },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Add Item' }));

    expect(onadd).toHaveBeenCalledTimes(1);
  });

  it('calls onremove with correct index when remove button is clicked', async () => {
    const mockItems = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
    ];
    const onremove = vi.fn();

    render(AddableField<{ id: number; name: string }>, {
      props: {
        title: 'Items',
        items: mockItems,
        onadd: vi.fn(),
        onremove,
        children,
      },
    });

    const removeButton = screen.getByRole('button', { name: 'Remove item 1' });
    await userEvent.click(removeButton);

    expect(onremove).toHaveBeenCalledWith(1);
  });

  it('renders error message', () => {
    render(AddableField<{ id: number; name: string }>, {
      props: {
        title: 'Items',
        items: [],
        onadd: vi.fn(),
        onremove: vi.fn(),
        error: 'At least one item is required',
        children,
      },
    });

    expect(screen.getByText('At least one item is required')).toBeInTheDocument();
  });

  it('passes item errors to children snippet', () => {
    const mockItems = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
    ];

    const itemErrors: Record<string, string>[] = [
      { name: 'Name is required' },
      { url: 'Invalid URL' },
    ];

    const childrenWithErrors = createRawSnippet<
      [{ id: number; name: string }, number, Record<string, string> | undefined]
    >((getItem, getIndex, getErrors) => {
      const errors = getErrors();
      return {
        render: () => (errors?.name ? `<span>${errors.name}</span>` : '<span>No errors</span>'),
      };
    });

    render(AddableField<{ id: number; name: string }>, {
      props: {
        title: 'Items',
        items: mockItems,
        onadd: vi.fn(),
        onremove: vi.fn(),
        itemErrors,
        children: childrenWithErrors,
      },
    });

    expect(screen.getByText('Name is required')).toBeInTheDocument();
  });
});
