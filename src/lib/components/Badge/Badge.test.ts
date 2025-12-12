import { render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, test } from 'vitest';

import { Badge } from './index.js';

describe('Badge', () => {
  const children = createRawSnippet(() => ({
    render: () => `<span>Test Label</span>`,
  }));

  test('renders children content', () => {
    render(Badge, {
      props: {
        variant: 'blue',
        children,
      },
    });
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  test('applies blue variant classes', () => {
    const { container } = render(Badge, {
      props: { variant: 'blue', children },
    });
    const badge = container.querySelector('div');
    expect(badge).toHaveClass('border-blue-400', 'bg-blue-200', 'text-blue-900');
  });

  test('applies cyan variant classes', () => {
    const { container } = render(Badge, {
      props: { variant: 'cyan', children },
    });
    const badge = container.querySelector('div');
    expect(badge).toHaveClass('border-cyan-400', 'bg-cyan-200', 'text-cyan-900');
  });

  test('applies orange variant classes', () => {
    const { container } = render(Badge, {
      props: { variant: 'orange', children },
    });
    const badge = container.querySelector('div');
    expect(badge).toHaveClass('border-orange-400', 'bg-orange-200', 'text-orange-900');
  });

  test('applies emerald variant classes', () => {
    const { container } = render(Badge, {
      props: { variant: 'emerald', children },
    });
    const badge = container.querySelector('div');
    expect(badge).toHaveClass('border-emerald-400', 'bg-emerald-200', 'text-emerald-900');
  });

  test('applies violet variant classes', () => {
    const { container } = render(Badge, {
      props: { variant: 'violet', children },
    });
    const badge = container.querySelector('div');
    expect(badge).toHaveClass('border-violet-400', 'bg-violet-200', 'text-violet-900');
  });

  test('applies pink variant classes', () => {
    const { container } = render(Badge, {
      props: { variant: 'pink', children },
    });
    const badge = container.querySelector('div');
    expect(badge).toHaveClass('border-pink-400', 'bg-pink-200', 'text-pink-900');
  });

  test('applies teal variant classes', () => {
    const { container } = render(Badge, {
      props: { variant: 'teal', children },
    });
    const badge = container.querySelector('div');
    expect(badge).toHaveClass('border-teal-400', 'bg-teal-200', 'text-teal-900');
  });

  test('applies sky variant classes', () => {
    const { container } = render(Badge, {
      props: { variant: 'sky', children },
    });
    const badge = container.querySelector('div');
    expect(badge).toHaveClass('border-sky-400', 'bg-sky-200', 'text-sky-900');
  });

  test('applies green variant classes', () => {
    const { container } = render(Badge, {
      props: { variant: 'green', children },
    });
    const badge = container.querySelector('div');
    expect(badge).toHaveClass('border-green-400', 'bg-green-200', 'text-green-900');
  });

  test('applies lime variant classes', () => {
    const { container } = render(Badge, {
      props: { variant: 'lime', children },
    });
    const badge = container.querySelector('div');
    expect(badge).toHaveClass('border-lime-400', 'bg-lime-200', 'text-lime-900');
  });

  test('applies slate variant classes', () => {
    const { container } = render(Badge, {
      props: { variant: 'slate', children },
    });
    const badge = container.querySelector('div');
    expect(badge).toHaveClass('border-transparent', 'bg-slate-200', 'text-slate-950');
  });

  test('applies slate-light variant classes', () => {
    const { container } = render(Badge, {
      props: { variant: 'slate-light', children },
    });
    const badge = container.querySelector('div');
    expect(badge).toHaveClass('border-slate-300', 'bg-slate-100', 'text-slate-900');
  });

  test('applies slate-dark variant classes', () => {
    const { container } = render(Badge, {
      props: { variant: 'slate-dark', children },
    });
    const badge = container.querySelector('div');
    expect(badge).toHaveClass('border-transparent', 'bg-slate-950', 'text-slate-100');
  });
});
