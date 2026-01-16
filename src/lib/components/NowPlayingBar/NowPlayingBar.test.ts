import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { NowPlayingBar } from './index.js';

describe('NowPlayingBar', () => {
  const defaultProps = {
    title: 'Test Track',
    isplaying: false,
    onclick: vi.fn(),
    onplay: vi.fn(),
  };

  test('displays track title', () => {
    render(NowPlayingBar, { props: defaultProps });
    expect(screen.getByText('Test Track')).toBeInTheDocument();
  });

  test('renders player cover image', () => {
    render(NowPlayingBar, { props: defaultProps });
    expect(screen.getByAltText('Player cover')).toBeInTheDocument();
  });

  test('shows Play icon when not playing', () => {
    render(NowPlayingBar, { props: { ...defaultProps, isplaying: false } });
    const button = screen.getByRole('button', { name: '' });
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  test('shows Pause icon when playing', () => {
    render(NowPlayingBar, { props: { ...defaultProps, isplaying: true } });
    const button = screen.getByRole('button', { name: '' });
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  test('calls onclick when bar is clicked', async () => {
    const user = userEvent.setup();
    const onclick = vi.fn();
    render(NowPlayingBar, { props: { ...defaultProps, onclick } });

    const bar = screen.getByRole('button', { name: /Test Track/i });
    await user.click(bar);
    expect(onclick).toHaveBeenCalledTimes(1);
  });

  test('calls onclick when Enter key is pressed', async () => {
    const user = userEvent.setup();
    const onclick = vi.fn();
    render(NowPlayingBar, { props: { ...defaultProps, onclick } });

    const bar = screen.getByRole('button', { name: /Test Track/i });
    bar.focus();
    await user.keyboard('{Enter}');
    expect(onclick).toHaveBeenCalledTimes(1);
  });

  test('calls onclick when Space key is pressed', async () => {
    const user = userEvent.setup();
    const onclick = vi.fn();
    render(NowPlayingBar, { props: { ...defaultProps, onclick } });

    const bar = screen.getByRole('button', { name: /Test Track/i });
    bar.focus();
    await user.keyboard(' ');
    expect(onclick).toHaveBeenCalledTimes(1);
  });

  test('calls onplay when play button is clicked', async () => {
    const user = userEvent.setup();
    const onplay = vi.fn();
    const onclick = vi.fn();
    render(NowPlayingBar, { props: { ...defaultProps, onclick, onplay } });

    const buttons = screen.getAllByRole('button');
    const playButton = buttons.find((btn) => btn.tagName === 'BUTTON');
    await user.click(playButton!);
    expect(onplay).toHaveBeenCalledTimes(1);
  });

  test('play button click does not trigger bar onclick', async () => {
    const user = userEvent.setup();
    const onplay = vi.fn();
    const onclick = vi.fn();
    render(NowPlayingBar, { props: { ...defaultProps, onclick, onplay } });

    const buttons = screen.getAllByRole('button');
    const playButton = buttons.find((btn) => btn.tagName === 'BUTTON');
    await user.click(playButton!);
    expect(onplay).toHaveBeenCalledTimes(1);
    expect(onclick).not.toHaveBeenCalled();
  });
});
