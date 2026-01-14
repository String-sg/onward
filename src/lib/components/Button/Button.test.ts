import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { createRawSnippet } from 'svelte';
import { describe, expect, test, vi } from 'vitest';

import { Button } from './index.js';

describe('Button', () => {
  const children = createRawSnippet(() => ({
    render: () => `<span>Button text</span>`,
  }));

  test('renders children content', () => {
    render(Button, { props: { children } });
    expect(screen.getByText('Button text')).toBeInTheDocument();
  });

  test('renders without children', () => {
    const { container } = render(Button, { props: {} });
    expect(container.querySelector('button')).toBeInTheDocument();
  });

  test('applies primary variant classes by default', () => {
    const { container } = render(Button, { props: { children } });
    const button = container.querySelector('button');
    expect(button).toHaveClass('border-transparent', 'bg-slate-950', 'text-white');
  });

  test('applies primary variant classes explicitly', () => {
    const { container } = render(Button, { props: { variant: 'primary', children } });
    const button = container.querySelector('button');
    expect(button).toHaveClass('border-transparent', 'bg-slate-950', 'text-white');
  });

  test('applies secondary variant classes', () => {
    const { container } = render(Button, { props: { variant: 'secondary', children } });
    const button = container.querySelector('button');
    expect(button).toHaveClass('border-slate-200', 'bg-white', 'text-slate-950');
  });

  test('applies fit width by default', () => {
    const { container } = render(Button, { props: { children } });
    const button = container.querySelector('button');
    expect(button).toHaveClass('w-fit');
  });

  test('applies full width', () => {
    const { container } = render(Button, { props: { width: 'full', children } });
    const button = container.querySelector('button');
    expect(button).toHaveClass('w-full');
  });

  test('is not disabled by default', () => {
    const { container } = render(Button, { props: { children } });
    const button = container.querySelector('button');
    expect(button).not.toBeDisabled();
  });

  test('is disabled when disabled prop is true', () => {
    const { container } = render(Button, { props: { disabled: true, children } });
    const button = container.querySelector('button');
    expect(button).toBeDisabled();
  });

  test('calls onclick handler when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(Button, { props: { children, onclick: handleClick } });

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('does not call onclick when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(Button, { props: { children, disabled: true, onclick: handleClick } });

    await user.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
