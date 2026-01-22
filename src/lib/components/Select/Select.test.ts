import { render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';

import Select from './Select.svelte';

describe('Select', () => {
  const options = createRawSnippet(() => ({
    render: () =>
      '<div><option value="1">Option 1</option><option value="2">Option 2</option></div>',
  }));

  it('renders select with options', () => {
    render(Select, { props: { children: options } });

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select).toBeInTheDocument();
    expect(select.tagName).toBe('SELECT');

    const allOptions = screen.getAllByRole('option');
    console.log(allOptions);
    expect(allOptions).toHaveLength(2);
    expect(allOptions[0]).toHaveTextContent('Option 1');
  });

  it('renders with selected value', () => {
    const optionsWithSelected = createRawSnippet(() => ({
      render: () => `<option value="2" selected>Option 2</option>`,
    }));

    render(Select, { props: { children: optionsWithSelected } });

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('2');
  });

  it('supports additional attributes', () => {
    render(Select, {
      props: {
        children: options,
        'data-testid': 'custom-select',
        title: 'Select an option',
        disabled: true,
      },
    });

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select).toHaveAttribute('data-testid', 'custom-select');
    expect(select).toHaveAttribute('title', 'Select an option');
    expect(select).toBeDisabled();
  });
});
