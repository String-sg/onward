import { render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';

import FormField from './FormField.svelte';

describe('FormField', () => {
  const children = createRawSnippet(() => ({
    render: () => `<input type="text" class="input" />`,
  }));

  it('renders the label', () => {
    render(FormField, { props: { label: 'Email Address', id: 'email', children } });

    expect(screen.getByText('Email Address')).toBeInTheDocument();
  });

  it('connects label to input via id', () => {
    render(FormField, { props: { label: 'Username', id: 'username', children } });

    const label = screen.getByText('Username');
    expect(label).toHaveAttribute('for', 'username');
  });

  it('renders children content', () => {
    render(FormField, { props: { label: 'Name', id: 'name', children } });

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('does not show * by default', () => {
    render(FormField, { props: { label: 'Optional Field', id: 'optional', children } });

    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('shows * when required is true', () => {
    render(FormField, {
      props: { label: 'Required Field', id: 'required', required: true, children },
    });

    const asterisk = screen.getByText('*');
    expect(asterisk).toBeInTheDocument();
    expect(asterisk.querySelector('.text-red-500')).not.toBeInTheDocument();
  });

  it('renders error message', () => {
    render(FormField, {
      props: { label: 'Field', id: 'field', error: 'This field is required', children },
    });

    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });
});
