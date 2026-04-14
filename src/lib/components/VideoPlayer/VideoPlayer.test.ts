import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { VideoPlayer } from './index.js';

vi.mock('$env/dynamic/public', () => ({
  env: {
    PUBLIC_GOOGLE_ANALYTICS_ID: 'test-ga-id',
  },
}));

beforeEach(() => {
  HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
  HTMLMediaElement.prototype.pause = vi.fn();
});

describe('VideoPlayer', () => {
  const defaultProps = {
    src: 'https://example.com/video.mp4',
    title: 'Test Video',
    tags: [],
    isopen: true,
    onclose: vi.fn(),
  };

  test('renders a video element with the correct src', () => {
    render(VideoPlayer, { props: defaultProps });

    const video = screen.getByTestId('video-player') as HTMLVideoElement;
    expect(video.tagName).toBe('VIDEO');
    expect(video.src).toBe('https://example.com/video.mp4');
  });

  test('renders play, skip back, skip forward, and close buttons', () => {
    render(VideoPlayer, { props: defaultProps });

    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Skip back' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Skip forward' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close video' })).toBeInTheDocument();
  });

  test('renders speed button with default speed', () => {
    render(VideoPlayer, { props: defaultProps });

    expect(screen.getByText('1.0x speed')).toBeInTheDocument();
  });

  test('displays initial time as 0:00', () => {
    render(VideoPlayer, { props: defaultProps });

    expect(screen.getByText('0:00')).toBeInTheDocument();
    expect(screen.getByText('-0:00')).toBeInTheDocument();
  });

  test('renders title', () => {
    render(VideoPlayer, { props: defaultProps });

    expect(screen.getByText('Test Video')).toBeInTheDocument();
  });

  test('renders tags as badges', () => {
    const props = { ...defaultProps, tags: [{ code: 'AI', label: 'Artificial Intelligence' }] };

    render(VideoPlayer, { props });

    expect(screen.getByText('Artificial Intelligence')).toBeInTheDocument();
  });

  test('calls play when play button is clicked', async () => {
    const user = userEvent.setup();
    render(VideoPlayer, { props: defaultProps });

    await user.click(screen.getByRole('button', { name: 'Play' }));

    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
  });

  test('shows Pause button while playing and Play button when paused', async () => {
    render(VideoPlayer, { props: defaultProps });
    const video = screen.getByTestId('video-player') as HTMLVideoElement;

    video.dispatchEvent(new Event('play'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
    });

    video.dispatchEvent(new Event('pause'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
    });
  });

  test('cycles through all playback speeds', async () => {
    const user = userEvent.setup();
    render(VideoPlayer, { props: defaultProps });

    await user.click(screen.getByText('1.0x speed'));
    expect(screen.getByText('1.5x speed')).toBeInTheDocument();

    await user.click(screen.getByText('1.5x speed'));
    expect(screen.getByText('2.0x speed')).toBeInTheDocument();

    await user.click(screen.getByText('2.0x speed'));
    expect(screen.getByText('0.5x speed')).toBeInTheDocument();

    await user.click(screen.getByText('0.5x speed'));
    expect(screen.getByText('1.0x speed')).toBeInTheDocument();
  });

  test('calls onclose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onclose = vi.fn();
    render(VideoPlayer, { props: { ...defaultProps, onclose } });

    await user.click(screen.getByRole('button', { name: 'Close video' }));

    expect(onclose).toHaveBeenCalledTimes(1);
  });
});
