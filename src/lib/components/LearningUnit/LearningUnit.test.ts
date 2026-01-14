import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { LearningUnit } from './index.js';

vi.mock('$env/dynamic/public', () => ({
  env: {
    PUBLIC_GOOGLE_ANALYTICS_ID: 'test-ga-id',
  },
}));

describe('LearningUnit', () => {
  const defaultProps = {
    to: '/unit/1',
    title: 'Test Learning Unit',
    tags: [{ code: 'AI', label: 'AI' }],
    createdat: new Date('2025-01-01'),
    createdby: 'John Doe',
    status: null,
  };

  test('renders as a link with correct href', () => {
    render(LearningUnit, { props: defaultProps });
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/unit/1');
  });

  test('displays title', () => {
    render(LearningUnit, { props: defaultProps });
    expect(screen.getByText('Test Learning Unit')).toBeInTheDocument();
  });

  test('displays creator name', () => {
    render(LearningUnit, { props: defaultProps });
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  test('displays relative time', () => {
    render(LearningUnit, { props: defaultProps });
    expect(screen.getByText(/ago/)).toBeInTheDocument();
  });

  test('displays REQUIRED status badge', () => {
    render(LearningUnit, { props: { ...defaultProps, status: 'REQUIRED' } });
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  test('displays COMPLETED status badge', () => {
    render(LearningUnit, { props: { ...defaultProps, status: 'COMPLETED' } });
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  test('displays OVERDUE status badge', () => {
    render(LearningUnit, { props: { ...defaultProps, status: 'OVERDUE' } });
    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });

  test('does not show status badge when status is null', () => {
    render(LearningUnit, { props: defaultProps });
    expect(screen.queryByText('Required')).not.toBeInTheDocument();
    expect(screen.queryByText('Completed')).not.toBeInTheDocument();
    expect(screen.queryByText('Overdue')).not.toBeInTheDocument();
  });

  test('shows Play button when player is provided and not active', () => {
    const player = {
      isactive: false,
      isplaying: false,
      onplay: vi.fn(),
      onpause: vi.fn(),
      onresume: vi.fn(),
    };
    render(LearningUnit, { props: { ...defaultProps, player } });
    expect(screen.getByText('Play')).toBeInTheDocument();
  });

  test('shows Pause button when player is active and playing', () => {
    const player = {
      isactive: true,
      isplaying: true,
      onplay: vi.fn(),
      onpause: vi.fn(),
      onresume: vi.fn(),
    };
    render(LearningUnit, { props: { ...defaultProps, player } });
    expect(screen.getByText('Pause')).toBeInTheDocument();
  });

  test('shows Resume button when player is active but not playing', () => {
    const player = {
      isactive: true,
      isplaying: false,
      onplay: vi.fn(),
      onpause: vi.fn(),
      onresume: vi.fn(),
    };
    render(LearningUnit, { props: { ...defaultProps, player } });
    expect(screen.getByText('Resume')).toBeInTheDocument();
  });

  test('calls onplay when Play button is clicked', async () => {
    const user = userEvent.setup();
    const player = {
      isactive: false,
      isplaying: false,
      onplay: vi.fn(),
      onpause: vi.fn(),
      onresume: vi.fn(),
    };
    render(LearningUnit, { props: { ...defaultProps, player } });

    await user.click(screen.getByText('Play'));
    expect(player.onplay).toHaveBeenCalledTimes(1);
  });

  test('calls onpause when Pause button is clicked', async () => {
    const user = userEvent.setup();
    const player = {
      isactive: true,
      isplaying: true,
      onplay: vi.fn(),
      onpause: vi.fn(),
      onresume: vi.fn(),
    };
    render(LearningUnit, { props: { ...defaultProps, player } });

    await user.click(screen.getByText('Pause'));
    expect(player.onpause).toHaveBeenCalledTimes(1);
  });

  test('calls onresume when Resume button is clicked', async () => {
    const user = userEvent.setup();
    const player = {
      isactive: true,
      isplaying: false,
      onplay: vi.fn(),
      onpause: vi.fn(),
      onresume: vi.fn(),
    };
    render(LearningUnit, { props: { ...defaultProps, player } });

    await user.click(screen.getByText('Resume'));
    expect(player.onresume).toHaveBeenCalledTimes(1);
  });

  test('does not show player controls when player is null', () => {
    render(LearningUnit, { props: defaultProps });
    expect(screen.queryByText('Play')).not.toBeInTheDocument();
    expect(screen.queryByText('Pause')).not.toBeInTheDocument();
    expect(screen.queryByText('Resume')).not.toBeInTheDocument();
  });
});
