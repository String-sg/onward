import { cleanup, render } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const mockOn = vi.fn();
const mockDestroy = vi.fn();
const mockSetCurrentTime = vi.fn();
const mockPlay = vi.fn().mockResolvedValue(undefined);
const mockPause = vi.fn().mockResolvedValue(undefined);
const mockGetCurrentTime = vi.fn().mockResolvedValue(45);

vi.mock('@vimeo/player', () => ({
  default: vi.fn().mockImplementation(() => ({
    on: mockOn,
    destroy: mockDestroy,
    setCurrentTime: mockSetCurrentTime,
    play: mockPlay,
    pause: mockPause,
    getCurrentTime: mockGetCurrentTime,
  })),
}));

import { noop } from '$lib/helpers/noop.js';

import { VimeoPlayer } from './index.js';

describe('VimeoPlayer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockOn.mockClear();
    mockDestroy.mockClear();
    mockSetCurrentTime.mockClear();
    mockPlay.mockClear();
    mockPause.mockClear();
    mockGetCurrentTime.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('renders a container div', () => {
    const { container } = render(VimeoPlayer, { props: { url: 'https://vimeo.com/123456789' } });
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  test('registers timeupdate and ended SDK events on mount', async () => {
    render(VimeoPlayer, { props: { url: 'https://vimeo.com/123456789' } });
    await vi.waitFor(() => expect(mockOn).toHaveBeenCalledWith('timeupdate', expect.any(Function)));
    expect(mockOn).toHaveBeenCalledWith('ended', expect.any(Function));
  });

  test('registers loaded event', async () => {
    render(VimeoPlayer, { props: { url: 'https://vimeo.com/123456789', startTime: 42 } });
    await vi.waitFor(() => expect(mockOn).toHaveBeenCalledWith('loaded', expect.any(Function)));
  });

  describe('loaded event', () => {
    test('seeks to startTime when startTime > 0', async () => {
      render(VimeoPlayer, { props: { url: 'https://vimeo.com/123456789', startTime: 42 } });
      await vi.waitFor(() => expect(mockOn).toHaveBeenCalledWith('loaded', expect.any(Function)));

      mockOn.mock.calls.find(([name]) => name === 'loaded')![1]();

      expect(mockSetCurrentTime).toHaveBeenCalledWith(42);
    });

    test('does not seek when startTime is 0', async () => {
      render(VimeoPlayer, { props: { url: 'https://vimeo.com/123456789', startTime: 0 } });
      await vi.waitFor(() => expect(mockOn).toHaveBeenCalledWith('loaded', expect.any(Function)));

      mockOn.mock.calls.find(([name]) => name === 'loaded')![1]();

      expect(mockSetCurrentTime).not.toHaveBeenCalled();
    });

    test('does not seek when startTime is not provided', async () => {
      render(VimeoPlayer, { props: { url: 'https://vimeo.com/123456789' } });
      await vi.waitFor(() => expect(mockOn).toHaveBeenCalledWith('loaded', expect.any(Function)));

      mockOn.mock.calls.find(([name]) => name === 'loaded')![1]();

      expect(mockSetCurrentTime).not.toHaveBeenCalled();
    });
  });

  describe('timeupdate event', () => {
    test('calls ontimeupdate with percent scaled to 0-100', async () => {
      const ontimeupdate = vi.fn();
      render(VimeoPlayer, {
        props: { url: 'https://vimeo.com/123456789', ontimeupdate },
      });
      await vi.waitFor(() =>
        expect(mockOn).toHaveBeenCalledWith('timeupdate', expect.any(Function)),
      );

      mockOn.mock.calls.find(([name]) => name === 'timeupdate')![1]({ percent: 0.5 });

      expect(ontimeupdate).toHaveBeenCalledWith(50);
    });
  });

  describe('ended event', () => {
    test('calls onended callback', async () => {
      const onended = vi.fn();
      render(VimeoPlayer, {
        props: { url: 'https://vimeo.com/123456789', onended },
      });
      await vi.waitFor(() => expect(mockOn).toHaveBeenCalledWith('ended', expect.any(Function)));

      mockOn.mock.calls.find(([name]) => name === 'ended')![1]();

      expect(onended).toHaveBeenCalledTimes(1);
    });
  });

  describe('active prop', () => {
    test('calls play when active is true (default)', async () => {
      render(VimeoPlayer, { props: { url: 'https://vimeo.com/123456789' } });
      await vi.waitFor(() => expect(mockPlay).toHaveBeenCalled());
    });

    test('calls pause when active is false', async () => {
      render(VimeoPlayer, { props: { url: 'https://vimeo.com/123456789', active: false } });
      await vi.waitFor(() => expect(mockPause).toHaveBeenCalled());
    });
  });

  describe('checkpoint tracking', () => {
    test('calls oncheckpoint after 10 seconds of accumulated play time', async () => {
      const oncheckpoint = vi.fn();
      render(VimeoPlayer, {
        props: { url: 'https://vimeo.com/123456789', oncheckpoint },
      });
      await vi.waitFor(() => expect(mockOn).toHaveBeenCalledWith('play', expect.any(Function)));

      mockOn.mock.calls.find(([name]) => name === 'play')![1]();

      for (let i = 0; i < 11; i++) {
        vi.advanceTimersByTime(1000);
        await vi.waitFor(() => {
          noop();
        });
      }

      expect(mockGetCurrentTime).toHaveBeenCalled();
      await vi.waitFor(() => expect(oncheckpoint).toHaveBeenCalledWith(45));
    });

    test('does not call oncheckpoint before 10 seconds', async () => {
      const oncheckpoint = vi.fn();
      render(VimeoPlayer, {
        props: { url: 'https://vimeo.com/123456789', oncheckpoint },
      });
      await vi.waitFor(() => expect(mockOn).toHaveBeenCalledWith('play', expect.any(Function)));

      mockOn.mock.calls.find(([name]) => name === 'play')![1]();

      for (let i = 0; i < 5; i++) {
        vi.advanceTimersByTime(1000);
        await vi.waitFor(() => {
          noop();
        });
      }

      expect(oncheckpoint).not.toHaveBeenCalled();
    });
  });

  describe('pause event', () => {
    test('calls onpause with currentTime after tracking session started', async () => {
      const onpause = vi.fn();
      const oncheckpoint = vi.fn();
      render(VimeoPlayer, {
        props: { url: 'https://vimeo.com/123456789', onpause, oncheckpoint },
      });
      await vi.waitFor(() => expect(mockOn).toHaveBeenCalledWith('play', expect.any(Function)));

      mockOn.mock.calls.find(([name]) => name === 'play')![1]();

      for (let i = 0; i < 11; i++) {
        vi.advanceTimersByTime(1000);
        await vi.waitFor(() => {
          noop();
        });
      }

      await vi.waitFor(() => expect(oncheckpoint).toHaveBeenCalled());

      await mockOn.mock.calls.find(([name]) => name === 'pause')![1]();

      expect(onpause).toHaveBeenCalledWith(45);
    });

    test('does not call onpause if tracking session has not started', async () => {
      const onpause = vi.fn();
      render(VimeoPlayer, {
        props: { url: 'https://vimeo.com/123456789', onpause },
      });
      await vi.waitFor(() => expect(mockOn).toHaveBeenCalledWith('pause', expect.any(Function)));

      await mockOn.mock.calls.find(([name]) => name === 'pause')![1]();

      expect(onpause).not.toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    test('destroys player on unmount', async () => {
      render(VimeoPlayer, { props: { url: 'https://vimeo.com/123456789' } });
      await vi.waitFor(() => expect(mockOn).toHaveBeenCalled());

      cleanup();

      expect(mockDestroy).toHaveBeenCalledTimes(1);
    });
  });
});
