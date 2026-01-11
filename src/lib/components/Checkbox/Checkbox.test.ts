import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import Checkbox from './Checkbox.svelte';

describe('Checkbox', () => {
  it('renders with the provided label', () => {
    render(Checkbox, { props: { label: 'Accept terms' } });

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(screen.getByText('Accept terms')).toBeInTheDocument();
  });

  it('renders unchecked by default', () => {
    render(Checkbox, { props: { label: 'Accept terms' } });

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });

  it('renders checked when checked prop is true', () => {
    render(Checkbox, { props: { label: 'Accept terms', checked: true } });

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it('applies custom classes to the label wrapper', () => {
    const { container } = render(Checkbox, {
      props: { label: 'Accept terms', class: 'custom-class' },
    });

    const label = container.querySelector('label');
    expect(label).toHaveClass('custom-class');
  });

  it('passes through additional HTML input attributes', () => {
    render(Checkbox, {
      props: {
        label: 'Accept terms',
        disabled: true,
        name: 'terms',
        value: 'accepted',
      },
    });

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.disabled).toBe(true);
    expect(checkbox.name).toBe('terms');
    expect(checkbox.value).toBe('accepted');
  });
});
