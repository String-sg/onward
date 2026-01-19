import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import ErrorMessage from './ErrorMessage.svelte';

describe('ErrorMessage', () => {
  it('renders error message', () => {
    render(ErrorMessage, { props: { message: 'This is an error' } });

    expect(screen.getByText('This is an error')).toBeInTheDocument();
  });
});
