import { render, screen } from '@testing-library/svelte';
import { describe, expect, test } from 'vitest';

import { EmptyStateView } from './index.js';

describe('EmptyStateView', () => {
  test('displays welcome message with username', () => {
    render(EmptyStateView, {
      props: { username: 'John', imagealt: 'Empty state image' },
    });
    expect(screen.getByText('Welcome John')).toBeInTheDocument();
  });

  test('displays instructional text', () => {
    render(EmptyStateView, {
      props: { username: 'Jane', imagealt: 'Empty state' },
    });
    expect(screen.getByText(/Kick off your learning journey/)).toBeInTheDocument();
    expect(screen.getByText(/into our exciting curated content!/)).toBeInTheDocument();
  });

  test('renders start learning link button', () => {
    render(EmptyStateView, {
      props: { username: 'Test', imagealt: 'Test image' },
    });
    const link = screen.getByRole('link', { name: 'Start learning' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/bites');
  });
});
