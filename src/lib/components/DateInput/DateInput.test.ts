import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import DateInput from './DateInput.svelte';

describe('DateInput', () => {
  it('renders a date input element', () => {
    const { container } = render(DateInput);

    const input = container.querySelector('input[type="date"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.type).toBe('date');
  });

  it('renders with the provided value', () => {
    const { container } = render(DateInput, { props: { value: '2026-01-12' } });

    const input = container.querySelector('input[type="date"]') as HTMLInputElement;
    expect(input.value).toBe('2026-01-12');
  });

  it('renders with an empty value by default', () => {
    const { container } = render(DateInput);

    const input = container.querySelector('input[type="date"]') as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('applies custom classes to the input', () => {
    const { container } = render(DateInput, { props: { class: 'custom-class' } });

    const input = container.querySelector('input[type="date"]');
    expect(input).toHaveClass('custom-class');
  });

  it('applies default styling classes', () => {
    const { container } = render(DateInput);

    const input = container.querySelector('input[type="date"]');
    expect(input).toHaveClass('w-full', 'rounded-md', 'border', 'border-slate-300');
  });

  it('passes through additional HTML input attributes', () => {
    const { container } = render(DateInput, {
      props: {
        id: 'start-date',
        name: 'startDate',
        required: true,
        disabled: true,
        min: '2026-01-01',
        max: '2026-12-31',
      },
    });

    const input = container.querySelector('input[type="date"]') as HTMLInputElement;
    expect(input.id).toBe('start-date');
    expect(input.name).toBe('startDate');
    expect(input.required).toBe(true);
    expect(input.disabled).toBe(true);
    expect(input.min).toBe('2026-01-01');
    expect(input.max).toBe('2026-12-31');
  });

  it('allows setting min and max dates', () => {
    const { container } = render(DateInput, {
      props: {
        min: '2026-01-01',
        max: '2026-12-31',
      },
    });

    const input = container.querySelector('input[type="date"]') as HTMLInputElement;
    expect(input.min).toBe('2026-01-01');
    expect(input.max).toBe('2026-12-31');
  });
});
