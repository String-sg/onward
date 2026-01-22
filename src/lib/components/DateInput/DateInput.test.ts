import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import DateInput from './DateInput.svelte';

describe('DateInput', () => {
  it('renders passed value', () => {
    const { container } = render(DateInput, { props: { value: '2026-01-12' } });

    const input = container.querySelector('input[type="date"]') as HTMLInputElement;
    expect(input.value).toBe('2026-01-12');
  });

  it('renders default value', () => {
    const { container } = render(DateInput);

    const input = container.querySelector('input[type="date"]') as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('forwards additional input attributes', () => {
    const { container } = render(DateInput, {
      props: {
        id: 'start-date',
        name: 'startDate',
        min: '2026-01-01',
      },
    });

    const input = container.querySelector('input[type="date"]') as HTMLInputElement;
    expect(input.min).toBe('2026-01-01');
  });
});
