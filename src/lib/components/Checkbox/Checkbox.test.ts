import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import Checkbox from './Checkbox.svelte';

describe('Checkbox', () => {
  it('renders with label', () => {
    render(Checkbox, { props: { label: 'Accept terms' } });

    expect(screen.getByLabelText('Accept terms')).toBeInTheDocument();
  });

  it('renders default checked prop', () => {
    render(Checkbox, { props: { label: 'Accept terms' } });

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });

  it('reflects checked prop', () => {
    render(Checkbox, { props: { label: 'Accept terms', checked: true } });

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it('forwards additional input attributes', () => {
    render(Checkbox, {
      props: {
        label: 'Accept terms',
        disabled: true,
      },
    });

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.disabled).toBe(true);
  });
});
