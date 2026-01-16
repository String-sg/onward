import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { NowPlayingView } from './index.js';

vi.mock('$env/dynamic/public', () => ({
  env: {
    PUBLIC_GOOGLE_ANALYTICS_ID: 'test-ga-id',
  },
}));

describe('NowPlayingView', () => {
  const defaultProps = {
    isopen: true,
    onclose: vi.fn(),
    isplaying: false,
    playbackspeed: 1.0,
    duration: 300,
    progress: 60,
    currenttrack: {
      id: '1',
      title: 'Test Track Title',
      summary: '**Test summary**',
      tags: [{ code: 'AI', label: 'AI' }],
      url: 'https://example.com/track.mp3',
      type: 'audio',
    },
    onplaypause: vi.fn(),
    onseek: vi.fn(),
    onskipback: vi.fn(),
    onskipforward: vi.fn(),
    onspeedchange: vi.fn(),
  };

  test('displays track title', () => {
    render(NowPlayingView, { props: defaultProps });
    expect(screen.getByText('Test Track Title')).toBeInTheDocument();
  });

  test('displays formatted progress time', () => {
    render(NowPlayingView, { props: defaultProps });
    expect(screen.getByText('1:00')).toBeInTheDocument();
  });

  test('displays playback speed', () => {
    render(NowPlayingView, { props: defaultProps });
    expect(screen.getByText('1.0x speed')).toBeInTheDocument();
  });

  test('calls onclose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onclose = vi.fn();
    render(NowPlayingView, { props: { ...defaultProps, onclose } });

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onclose).toHaveBeenCalledTimes(1);
  });

  test('calls onplaypause when play/pause button is clicked', async () => {
    const user = userEvent.setup();
    const onplaypause = vi.fn();
    render(NowPlayingView, { props: { ...defaultProps, onplaypause } });

    await user.click(screen.getByRole('button', { name: /Play|Pause/ }));
    expect(onplaypause).toHaveBeenCalledTimes(1);
  });

  test('calls onskipback when skip back button is clicked', async () => {
    const user = userEvent.setup();
    const onskipback = vi.fn();
    render(NowPlayingView, { props: { ...defaultProps, onskipback } });

    await user.click(screen.getByRole('button', { name: 'Skip back' }));
    expect(onskipback).toHaveBeenCalledTimes(1);
  });

  test('calls onskipforward when skip forward button is clicked', async () => {
    const user = userEvent.setup();
    const onskipforward = vi.fn();
    render(NowPlayingView, { props: { ...defaultProps, onskipforward } });

    await user.click(screen.getByRole('button', { name: 'Skip forward' }));
    expect(onskipforward).toHaveBeenCalledTimes(1);
  });

  test('calls onspeedchange when speed button is clicked', async () => {
    const user = userEvent.setup();
    const onspeedchange = vi.fn();
    render(NowPlayingView, { props: { ...defaultProps, onspeedchange } });

    await user.click(screen.getByText('1.0x speed'));
    expect(onspeedchange).toHaveBeenCalledTimes(1);
  });

  test('renders link to track detail page', () => {
    render(NowPlayingView, { props: defaultProps });
    const link = screen.getByRole('link', { name: 'Test Track Title' });
    expect(link).toHaveAttribute('href', '/unit/1');
  });
});
