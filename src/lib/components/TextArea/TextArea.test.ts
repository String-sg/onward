import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import TextArea from './TextArea.svelte';

describe('TextArea', () => {
  it('renders textbox', () => {
    render(TextArea);

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('shows passed value prop', () => {
    render(TextArea, { props: { value: 'Hello World\nMultiline text' } });

    expect(screen.getByRole('textbox') as HTMLTextAreaElement).toHaveValue(
      'Hello World\nMultiline text',
    );
  });

  it('shows passed rows prop', () => {
    render(TextArea, { props: { rows: 3 } });

    expect(screen.getByRole('textbox') as HTMLTextAreaElement).toHaveAttribute('rows', '3');
  });
});
