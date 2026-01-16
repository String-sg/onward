import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { createRawSnippet } from 'svelte';
import { describe, expect, test, vi } from 'vitest';

import { LinkButton } from './index.js';

describe('LinkButton', () => {
  const children = createRawSnippet(() => ({
    render: () => `<span>LinkButton text</span>`,
  }));

  test('renders children content', () => {
    render(LinkButton, { props: { children } });
    expect(screen.getByText('LinkButton text')).toBeInTheDocument();
  });

  test('renders without children', () => {
    const { container } = render(LinkButton, { props: {} });
    expect(container.querySelector('a')).toBeInTheDocument();
  });

  test('applies primary variant classes by default', () => {
    const { container } = render(LinkButton, { props: { children } });
    const button = container.querySelector('a');
    expect(button).toHaveClass('border-transparent', 'bg-slate-950', 'text-white');
  });

  test('applies primary variant classes explicitly', () => {
    const { container } = render(LinkButton, { props: { variant: 'primary', children } });
    const button = container.querySelector('a');
    expect(button).toHaveClass('border-transparent', 'bg-slate-950', 'text-white');
  });

  test('applies secondary variant classes', () => {
    const { container } = render(LinkButton, { props: { variant: 'secondary', children } });
    const button = container.querySelector('a');
    expect(button).toHaveClass('border-slate-200', 'bg-white', 'text-slate-950');
  });

  test('applies fit width by default', () => {
    const { container } = render(LinkButton, { props: { children } });
    const button = container.querySelector('a');
    expect(button).toHaveClass('w-fit');
  });

  test('applies full width', () => {
    const { container } = render(LinkButton, { props: { width: 'full', children } });
    const button = container.querySelector('a');
    expect(button).toHaveClass('w-full');
  });

  test('is not disabled by default', () => {
    const { container } = render(LinkButton, { props: { children } });
    const button = container.querySelector('a');
    expect(button).not.toBeDisabled();
  });

  test('is disabled when disabled prop is true', () => {
    const { container } = render(LinkButton, { props: { disabled: true, children } });
    const button = container.querySelector('a');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  test('calls onclick handler when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(LinkButton, { props: { href: '/test', children, onclick: handleClick } });
    await user.click(screen.getByRole('link'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('removes href when disabled', () => {
    const { container } = render(LinkButton, {
      props: { href: '/test', disabled: true, children },
    });
    const link = container.querySelector('a');
    expect(link).not.toHaveAttribute('href');
  });
});
