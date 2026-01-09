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
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    const columns = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' },
    ];

    render(Table, { props: { data: [], columns, emptyMessage: 'No items' } });

    expect(screen.getByText('No items')).toBeInTheDocument();
  });

  it('renders default empty message when not provided', () => {
    const columns = [{ key: 'id', label: 'ID' }];

    render(Table, { props: { data: [], columns } });

    expect(screen.getByText('No data found')).toBeInTheDocument();
  });

  it('renders title and description when provided', () => {
    const data = [{ id: 1, name: 'John' }];
    const columns = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' },
    ];

    render(Table, {
      props: {
        data,
        columns,
        title: 'Test Table',
        description: 'A test description',
      },
    });

    expect(screen.getByText('Test Table')).toBeInTheDocument();
    expect(screen.getByText('A test description')).toBeInTheDocument();
  });

  it('renders without title and description', () => {
    const data = [{ id: 1, name: 'John' }];
    const columns = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' },
    ];

    render(Table, { props: { data, columns } });

    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('displays raw values without formatting', () => {
    const data = [
      { id: 1, value: 100, status: true },
      { id: 2, value: 200, status: false },
    ];
    const columns = [
      { key: 'id', label: 'ID' },
      { key: 'value', label: 'Value' },
      { key: 'status', label: 'Status' },
    ];

    render(Table, { props: { data, columns } });

    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('true')).toBeInTheDocument();
    expect(screen.getByText('false')).toBeInTheDocument();
  });
});
