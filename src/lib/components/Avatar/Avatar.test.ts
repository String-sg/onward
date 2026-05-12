import { render, screen } from '@testing-library/svelte';
import { describe, expect, test } from 'vitest';

import { Avatar } from './index.js';

describe('Avatar', () => {
  test('renders img with the given src when src is provided', () => {
    const props = { src: 'data:image/png;base64,abc', name: 'Alice' };

    render(Avatar, { props });

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'data:image/png;base64,abc');
  });

  test('renders initials chip with first letter of name when src is null', () => {
    const props = { src: null, name: 'Alice' };

    render(Avatar, { props });

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  test('uppercases the initial', () => {
    const props = { src: null, name: 'alice' };

    render(Avatar, { props });

    expect(screen.getByText('A')).toBeInTheDocument();
  });

  test('trims leading whitespace before taking the initial', () => {
    const props = { src: null, name: '  alice' };

    render(Avatar, { props });

    expect(screen.getByText('A')).toBeInTheDocument();
  });
});
