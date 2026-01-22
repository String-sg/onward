import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import TextInput from './TextInput.svelte';

describe('TextInput', () => {
  it('renders with type text', () => {
    render(TextInput, { props: { type: 'text' } });

    const input = screen.getByRole('textbox') as HTMLInputElement;

    expect(input).toBeInTheDocument();
    expect(input.type).toBe('text');
  });

  it('renders with passed type prop', () => {
    render(TextInput, { props: { type: 'url' } });

    const input = screen.getByRole('textbox') as HTMLInputElement;

    expect(input).toBeInTheDocument();
    expect(input.type).toBe('url');
  });

  it('shows passed value prop', () => {
    render(TextInput, { props: { type: 'text', value: 'Hello World' } });

    expect(screen.getByRole('textbox') as HTMLInputElement).toHaveValue('Hello World');
  });
});
