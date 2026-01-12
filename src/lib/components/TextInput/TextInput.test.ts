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

  it('renders with type url', () => {
    render(TextInput, { props: { type: 'url' } });

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.type).toBe('url');
  });

  it('renders with the provided value', () => {
    render(TextInput, { props: { type: 'text', value: 'Hello World' } });

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('Hello World');
  });

  it('renders with empty value by default', () => {
    render(TextInput, { props: { type: 'text' } });

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('applies custom classes', () => {
    render(TextInput, { props: { type: 'text', class: 'custom-class' } });

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-class');
  });

  it('applies default styling classes', () => {
    render(TextInput, { props: { type: 'text' } });

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass(
      'w-full',
      'rounded-md',
      'border',
      'border-slate-300',
      'px-3',
      'py-2',
      'shadow-sm',
    );
    expect(input).toHaveClass(
      'focus:outline-none',
      'focus-visible:outline-2',
      'focus-visible:outline-offset-2',
      'focus-visible:outline-slate-950',
      'focus-visible:outline-dashed',
    );
  });

  it('passes through additional HTML input attributes', () => {
    render(TextInput, {
      props: {
        type: 'text',
        placeholder: 'Enter text',
        disabled: true,
        name: 'username',
        required: true,
      },
    });

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.placeholder).toBe('Enter text');
    expect(input.disabled).toBe(true);
    expect(input.name).toBe('username');
    expect(input.required).toBe(true);
  });

  it('supports autocomplete attribute', () => {
    render(TextInput, {
      props: {
        type: 'text',
        autocomplete: 'email',
      },
    });

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.autocomplete).toBe('email');
  });

  it('supports maxlength attribute', () => {
    render(TextInput, {
      props: {
        type: 'text',
        maxlength: 100,
      },
    });

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.maxLength).toBe(100);
  });

  it('supports readonly attribute', () => {
    render(TextInput, {
      props: {
        type: 'text',
        readonly: true,
      },
    });

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.readOnly).toBe(true);
  });

  it('supports pattern attribute', () => {
    render(TextInput, {
      props: {
        type: 'text',
        pattern: '[A-Za-z]+',
      },
    });

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.pattern).toBe('[A-Za-z]+');
  });
});
