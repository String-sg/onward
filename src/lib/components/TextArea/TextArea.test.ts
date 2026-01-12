import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import TextArea from './TextArea.svelte';

describe('TextArea', () => {
  it('renders a textarea element', () => {
    render(TextArea);

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('renders with the provided value', () => {
    render(TextArea, { props: { value: 'Hello World\nMultiline text' } });

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.value).toBe('Hello World\nMultiline text');
  });

  it('renders with empty value by default', () => {
    render(TextArea);

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.value).toBe('');
  });

  it('applies custom classes', () => {
    render(TextArea, { props: { class: 'custom-class another-class' } });

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('custom-class', 'another-class');
  });

  it('applies default styling classes', () => {
    render(TextArea);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass(
      'w-full',
      'resize-none',
      'rounded-md',
      'border',
      'border-slate-300',
      'px-3',
      'py-2',
      'shadow-sm',
    );
    expect(textarea).toHaveClass(
      'focus:outline-none',
      'focus-visible:outline-2',
      'focus-visible:outline-offset-2',
      'focus-visible:outline-slate-950',
      'focus-visible:outline-dashed',
    );
  });

  it('passes through additional HTML textarea attributes', () => {
    render(TextArea, {
      props: {
        placeholder: 'Enter description',
        disabled: true,
        name: 'description',
        required: true,
      },
    });

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.placeholder).toBe('Enter description');
    expect(textarea.disabled).toBe(true);
    expect(textarea.name).toBe('description');
    expect(textarea.required).toBe(true);
  });
});
