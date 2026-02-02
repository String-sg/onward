import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import Table from './Table.svelte';

describe('Table', () => {
  it('renders table with data', () => {
    const data = [
      { id: 1, name: 'John', age: 30 },
      { id: 2, name: 'Jane', age: 25 },
    ];

    const columns = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' },
      { key: 'age', label: 'Age' },
    ];

    render(Table, { props: { data, columns } });

    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Jane')).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    const columns = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' },
    ];

    render(Table, { props: { data: [], columns, emptyMessage: 'No items' } });

    expect(screen.getByText('No items')).toBeInTheDocument();
  });
});
