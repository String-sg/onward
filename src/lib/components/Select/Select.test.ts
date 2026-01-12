import { render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';

import Select from './Select.svelte';

describe('Select', () => {
  const options = createRawSnippet(() => ({
    render: () => `<option value="1">Option 1</option>`,
  }));

  it('renders a select element with options', () => {
    render(Select, { props: { children: options } });

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select).toBeInTheDocument();
    expect(select.tagName).toBe('SELECT');

    const allOptions = screen.getAllByRole('option');
    expect(allOptions).toHaveLength(1);
    expect(allOptions[0]).toHaveTextContent('Option 1');
  });

  it('applies custom classes', () => {
    render(Select, { props: { children: options, class: 'custom-class' } });

    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('custom-class');
  });

  it('applies default styling classes', () => {
    render(Select, { props: { children: options } });

    const select = screen.getByRole('combobox');
    expect(select).toHaveClass(
      'w-full',
      'rounded-md',
      'border',
      'border-slate-300',
      'px-3',
      'py-2',
      'shadow-sm',
    );
    expect(select).toHaveClass(
      'focus:outline-none',
      'focus-visible:outline-2',
      'focus-visible:outline-offset-2',
      'focus-visible:outline-slate-950',
      'focus-visible:outline-dashed',
    );
  });

  it('passes through additional HTML select attributes', () => {
    render(Select, {
      props: {
        children: options,
        disabled: true,
        name: 'category',
        required: true,
      },
    });

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.disabled).toBe(true);
    expect(select.name).toBe('category');
    expect(select.required).toBe(true);
  });

  it('renders with selected value', () => {
    const optionsWithSelected = createRawSnippet(() => ({
      render: () => `<option value="2" selected>Option 2</option>`,
    }));

    render(Select, { props: { children: optionsWithSelected } });

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('2');
  });
});
