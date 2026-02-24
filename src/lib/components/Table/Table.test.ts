import { render, screen } from '@testing-library/svelte';
import type { Component } from 'svelte';
import { describe, expect, it } from 'vitest';

import Table from './Table.svelte';
import type { Column } from './types';

describe('Table', () => {
  it('renders table with data', () => {
    const data = [
      { id: 1, name: 'John', age: 30 },
      { id: 2, name: 'Jane', age: 25 },
    ];

    type Row = (typeof data)[number];
    const columns: Column<Row>[] = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' },
      { key: 'age', label: 'Age' },
    ];

    render(Table as Component<{ data: Row[]; columns: Column<Row>[] }>, {
      props: { data, columns },
    });

    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Jane')).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    interface Row {
      id: number;
      name: string;
    }
    const columns: Column<Row>[] = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' },
    ];

    render(Table as Component<{ data: Row[]; columns: Column<Row>[]; emptyMessage?: string }>, {
      props: { data: [] as Row[], columns, emptyMessage: 'No items' },
    });

    expect(screen.getByText('No items')).toBeInTheDocument();
  });
});
