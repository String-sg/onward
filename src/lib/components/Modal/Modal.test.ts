import { render } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { Modal } from './index.js';

describe('Modal', () => {
  test('does not render when isopen is false', () => {
    render(Modal, {
      props: { isopen: true, onclose: vi.fn(), 'data-testid': 'modal' },
    });
    expect(document.body.querySelector('.test-modal')).not.toBeInTheDocument();
  });

  test('renders when isopen is true', () => {
    render(Modal, {
      props: { isopen: true, onclose: vi.fn(), 'data-testid': 'modal' },
    });
    expect(document.body.querySelector('[data-testid="modal"]')).toBeInTheDocument();
  });

  test('applies light variant by default', () => {
    render(Modal, {
      props: { isopen: true, onclose: vi.fn(), 'data-testid': 'modal' },
    });
    const modal = document.body.querySelector('[data-testid="modal"]');
    expect(modal).toHaveClass('bg-white');
  });

  test('applies dark variant classes', () => {
    render(Modal, {
      props: { isopen: true, onclose: vi.fn(), variant: 'dark', 'data-testid': 'modal' },
    });
    const modal = document.body.querySelector('[data-testid="modal"]');
    expect(modal).toHaveClass('bg-slate-950', 'text-white');
  });

  test('applies full size by default', () => {
    render(Modal, {
      props: { isopen: true, onclose: vi.fn(), 'data-testid': 'modal' },
    });
    const modal = document.body.querySelector('[data-testid="modal"]');
    expect(modal).toHaveClass('inset-0');
  });

  test('applies partial size classes', () => {
    render(Modal, {
      props: { isopen: true, onclose: vi.fn(), size: 'partial', 'data-testid': 'modal' },
    });
    const modal = document.body.querySelector('[data-testid="modal"]');
    expect(modal).toHaveClass('inset-x-0', 'top-1/4', 'bottom-0');
  });

  test('calls onclose when escape key is pressed', async () => {
    const user = userEvent.setup();
    const onclose = vi.fn();
    render(Modal, { props: { isopen: true, onclose } });

    await user.keyboard('{Escape}');
    expect(onclose).toHaveBeenCalledTimes(1);
  });

  test('does not call onclose on escape when closeonescape is false', async () => {
    const user = userEvent.setup();
    const onclose = vi.fn();
    render(Modal, { props: { isopen: true, onclose, closeonescape: false } });

    await user.keyboard('{Escape}');
    expect(onclose).not.toHaveBeenCalled();
  });

  test('calls onclose when backdrop is clicked', async () => {
    const user = userEvent.setup();
    const onclose = vi.fn();
    render(Modal, { props: { isopen: true, onclose } });

    const backdrop = document.body.querySelector('.bg-slate-950\\/50');
    await user.click(backdrop!);
    expect(onclose).toHaveBeenCalledTimes(1);
  });

  test('does not call onclose on backdrop click when closeonbackdropclick is false', async () => {
    const user = userEvent.setup();
    const onclose = vi.fn();
    render(Modal, {
      props: { isopen: true, onclose, closeonbackdropclick: false },
    });

    const backdrop = document.body.querySelector('.bg-slate-950\\/50');
    await user.click(backdrop!);
    expect(onclose).not.toHaveBeenCalled();
  });
});
