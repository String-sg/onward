import { render, screen } from '@testing-library/svelte';
import { describe, expect, test, vi } from 'vitest';

import Page from './+page.svelte';

vi.mock('$app/navigation', () => ({
  afterNavigate: vi.fn(),
}));

vi.mock('$env/dynamic/public', () => ({
  env: {},
}));

// Must be a function expression, not an arrow: the page calls
// `new IntersectionObserver(…)`, and Vitest 4 constructs the mock implementation directly.
global.IntersectionObserver = vi.fn().mockImplementation(function () {
  return {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  };
});

const data = {
  name: 'Test Teacher',
  email: 'teacher@example.com',
  avatar: '',
  csrfToken: 'csrf-token',
  sevenDaysAgo: new Date('2026-09-16'),
  thirtyDaysAgo: new Date('2026-08-24'),
  oneYearAgo: new Date('2025-09-23'),
  firstRecordDate: null,
  learningUnitsCompletedByWeek: 0,
  learningUnitsCompletedByMonth: 0,
  learningUnitsCompletedByYear: 0,
  learningUnitsCompletedByAll: 0,
  learningUnitsConsumedByWeek: 0,
  learningUnitsConsumedByMonth: 0,
  learningUnitsConsumedByYear: 0,
  learningUnitsConsumedByAll: 0,
};

const renderPage = () => render(Page, { props: { data } as never });

describe('Profile page logout button', () => {
  test('shows in pink with white text', () => {
    renderPage();

    const button = screen.getByRole('button', { name: 'Log out' });
    expect(button).toHaveClass('bg-pink-600', 'text-white');
  });

  test('darkens to a deeper pink on hover', () => {
    renderPage();

    const button = screen.getByRole('button', { name: 'Log out' });
    expect(button).toHaveClass('hover:bg-pink-700');
    expect(button).not.toHaveClass('hover:bg-slate-200');
  });

  // Guards the restyle: sign-out must stay a POST that carries the CSRF token.
  test('still signs out through a POST form to /logout with the CSRF token', () => {
    renderPage();

    const form = screen.getByRole('button', { name: 'Log out' }).closest('form');
    expect(form).toHaveAttribute('method', 'POST');
    expect(form).toHaveAttribute('action', '/logout');
    expect(form?.querySelector('input[name="csrfToken"]')).toHaveValue('csrf-token');
  });
});
