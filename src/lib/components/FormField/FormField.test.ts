import { render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';

import FormField from './FormField.svelte';

describe('FormField', () => {
  const children = createRawSnippet(() => ({
    render: () => `<input type="text" id="test-input" />`,
  }));

  it('renders label', () => {
    render(FormField, { props: { label: 'Email Address', id: 'email', children } });

    expect(screen.getByText('Email Address')).toBeInTheDocument();
  });

  it("connects label to input using 'for' attribute", () => {
    render(FormField, { props: { label: 'Username', id: 'username', children } });

    expect(screen.getByText('Username')).toHaveAttribute('for', 'username');
  });

  it('renders child input element', () => {
    render(FormField, { props: { label: 'Name', id: 'name', children } });

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('shows required indicator when field is required', () => {
    render(FormField, {
      props: { label: 'Required Field', id: 'required', required: true, children },
    });

    const asterisk = screen.getByText('*');
    expect(asterisk).toBeInTheDocument();
    expect(asterisk).toHaveClass('text-red-500');
  });

  it('displays error message when provided', () => {
    render(FormField, {
      props: { label: 'Field', id: 'field', error: 'This field is required', children },
    });

    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });
});
