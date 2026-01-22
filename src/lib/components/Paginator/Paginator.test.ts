import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import Paginator from './Paginator.svelte';

describe('Paginator', () => {
  it('shows text with correct total count', () => {
    render(Paginator, {
      props: {
        totalCount: 100,
        currentPage: 1,
        pageSize: 10,
        onpagechange: vi.fn(),
      },
    });

    expect(screen.getByText('Showing 10 of 100')).toBeInTheDocument();
  });

  it('displays current page in input', () => {
    render(Paginator, {
      props: {
        totalCount: 100,
        currentPage: 5,
        pageSize: 10,
        onpagechange: vi.fn(),
      },
    });

    const input = screen.getByLabelText('Current page') as HTMLInputElement;

    expect(input.value).toBe('5');
  });

  it('displays total pages correctly', () => {
    render(Paginator, {
      props: {
        totalCount: 100,
        currentPage: 1,
        pageSize: 10,
        onpagechange: vi.fn(),
      },
    });

    expect(screen.getByText('of 10')).toBeInTheDocument();
  });

  it('disables previous button on first page', () => {
    const { container } = render(Paginator, {
      props: {
        totalCount: 100,
        currentPage: 1,
        pageSize: 10,
        onpagechange: vi.fn(),
      },
    });

    const buttons = container.querySelectorAll('button');
    const prevButton = buttons[0];

    expect(prevButton).toBeDisabled();
  });

  it('enables previous button when not on first page', () => {
    const { container } = render(Paginator, {
      props: {
        totalCount: 100,
        currentPage: 2,
        pageSize: 10,
        onpagechange: vi.fn(),
      },
    });

    const buttons = container.querySelectorAll('button');
    const prevButton = buttons[0];
    expect(prevButton).not.toBeDisabled();
  });

  it('disables next button on last page', () => {
    const { container } = render(Paginator, {
      props: {
        totalCount: 100,
        currentPage: 10,
        pageSize: 10,
        onpagechange: vi.fn(),
      },
    });

    const buttons = container.querySelectorAll('button');
    const nextButton = buttons[1];
    expect(nextButton).toBeDisabled();
  });

  it('enables next button when not on last page', () => {
    const { container } = render(Paginator, {
      props: {
        totalCount: 100,
        currentPage: 5,
        pageSize: 10,
        onpagechange: vi.fn(),
      },
    });

    const buttons = container.querySelectorAll('button');
    const nextButton = buttons[1];
    expect(nextButton).not.toBeDisabled();
  });

  it('calls onpagechange when previous button clicked', async () => {
    const user = userEvent.setup();
    const handlePageChange = vi.fn();
    const { container } = render(Paginator, {
      props: {
        totalCount: 100,
        currentPage: 5,
        pageSize: 10,
        onpagechange: handlePageChange,
      },
    });

    const buttons = container.querySelectorAll('button');
    const prevButton = buttons[0];
    await user.click(prevButton);

    expect(handlePageChange).toHaveBeenCalledTimes(1);
    expect(handlePageChange).toHaveBeenCalledWith(4);
  });

  it('calls onpagechange when next button clicked', async () => {
    const user = userEvent.setup();
    const handlePageChange = vi.fn();
    const { container } = render(Paginator, {
      props: {
        totalCount: 100,
        currentPage: 5,
        pageSize: 10,
        onpagechange: handlePageChange,
      },
    });

    const buttons = container.querySelectorAll('button');
    const nextButton = buttons[1];
    await user.click(nextButton);

    expect(handlePageChange).toHaveBeenCalledTimes(1);
    expect(handlePageChange).toHaveBeenCalledWith(6);
  });

  it('calls onpagechange when valid page entered in input and blurred', async () => {
    const user = userEvent.setup();
    const handlePageChange = vi.fn();
    render(Paginator, {
      props: {
        totalCount: 100,
        currentPage: 1,
        pageSize: 10,
        onpagechange: handlePageChange,
      },
    });

    const input = screen.getByLabelText('Current page');
    await user.clear(input);
    await user.type(input, '7');
    await user.tab(); // Trigger blur

    expect(handlePageChange).toHaveBeenCalledTimes(1);
    expect(handlePageChange).toHaveBeenCalledWith(7);
  });

  it('calls onpagechange when Enter key pressed in input', async () => {
    const user = userEvent.setup();
    const handlePageChange = vi.fn();
    render(Paginator, {
      props: {
        totalCount: 100,
        currentPage: 1,
        pageSize: 10,
        onpagechange: handlePageChange,
      },
    });

    const input = screen.getByLabelText('Current page');
    await user.clear(input);
    await user.type(input, '3{Enter}');

    expect(handlePageChange).toHaveBeenCalledTimes(1);
    expect(handlePageChange).toHaveBeenCalledWith(3);
  });

  it('does not call onpagechange for invalid page number (too low)', async () => {
    const user = userEvent.setup();
    const handlePageChange = vi.fn();
    render(Paginator, {
      props: {
        totalCount: 100,
        currentPage: 5,
        pageSize: 10,
        onpagechange: handlePageChange,
      },
    });

    const input = screen.getByLabelText('Current page');
    await user.clear(input);
    await user.type(input, '0');
    await user.tab();

    expect(handlePageChange).not.toHaveBeenCalled();
  });

  it('does not call onpagechange for invalid page number (too high)', async () => {
    const user = userEvent.setup();
    const handlePageChange = vi.fn();
    render(Paginator, {
      props: {
        totalCount: 100,
        currentPage: 5,
        pageSize: 10,
        onpagechange: handlePageChange,
      },
    });

    const input = screen.getByLabelText('Current page');
    await user.clear(input);
    await user.type(input, '11');
    await user.tab();

    expect(handlePageChange).not.toHaveBeenCalled();
  });

  it('does not call onpagechange for non-numeric input', async () => {
    const user = userEvent.setup();
    const handlePageChange = vi.fn();
    render(Paginator, {
      props: {
        totalCount: 100,
        currentPage: 5,
        pageSize: 10,
        onpagechange: handlePageChange,
      },
    });

    const input = screen.getByLabelText('Current page');
    await user.clear(input);
    await user.type(input, 'abc');
    await user.tab();

    expect(handlePageChange).not.toHaveBeenCalled();
  });

  it('calculates total pages correctly with remainder', () => {
    render(Paginator, {
      props: {
        totalCount: 95,
        currentPage: 1,
        pageSize: 10,
        onpagechange: vi.fn(),
      },
    });

    expect(screen.getByText('of 10')).toBeInTheDocument();
  });

  it('handles single page correctly', () => {
    const { container } = render(Paginator, {
      props: {
        totalCount: 5,
        currentPage: 1,
        pageSize: 10,
        onpagechange: vi.fn(),
      },
    });

    expect(screen.getByText('Showing 5 of 5')).toBeInTheDocument();
    expect(screen.getByText('of 1')).toBeInTheDocument();

    const buttons = container.querySelectorAll('button');
    const prevButton = buttons[0];
    const nextButton = buttons[1];
    expect(prevButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
  });
});
