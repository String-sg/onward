import { getContext, setContext } from 'svelte';

import { browser } from '$app/environment';

const PLAYER_CONTEXT_KEY = Symbol('Player');

const PLAYBACK_SPEED_OPTIONS = [0.5, 1.0, 1.5, 2.0];

export interface Track {
  id: string;
  tags: { code: string; label: string }[];
  title: string;
  summary: string;
  url: string;
  type: string;
}

/**
 * A media player class that manages playback state and track metadata.
 *
 * This class uses Svelte's reactive state management to track the current playing
 * state and loaded track information. It provides methods for playing, pausing,
 * toggling, and stopping playback, as well as static methods for creating and
 * retrieving player instances from Svelte context.
 *
 * @example
 * ```typescript
 * // Create a new player instance in a Svelte component.
 * const player = Player.create();
 *
 * // Play a track.
 * player.play({ id: 1, title: 'My Track' });
 *
 * // Toggle playback.
 * player.toggle();
 *
 * // Check if playing.
 * console.log(player.isPlaying); // true or false
 *
 * // Get current track.
 * console.log(player.currentTrack); // { id: 1, title: 'My Track' } or null
 * ```
 */
export class Player extends EventTarget {
  #currentTrack = $state.raw<Track | null>(null);
  #isPlaying = $state(false);
  #duration = $state(0);
  #progress = $state(0);
  #playbackSpeedIndex = $state(1);
  #cumulativePlayTime = 0;
  #trackingTimer: number | null = null;
  #hasTracked20Percent = $state(false);
  #hasTracked100Percent = $state(false);

  #audio: HTMLAudioElement | null = null;

  constructor() {
    super();

    $effect.pre(() => {
      this.#audio = new Audio();

      this.#audio.onloadedmetadata = () => {
        this.#duration = this.#audio?.duration || 0;
        this.#progress = 0;
        this.#hasTracked20Percent = false;
        this.#hasTracked100Percent = false;
      };
      this.#audio.ontimeupdate = () => {
        this.#progress = this.#audio?.currentTime || 0;

        if (!this.#currentTrack || this.#duration <= 0) {
          return;
        }

        if (this.#progress >= this.#duration * 0.2 && !this.#hasTracked20Percent) {
          this.#hasTracked20Percent = true;
          this.dispatchEvent(new Event('twentyPercent'));
        }

        if (this.#progress >= this.#duration && !this.#hasTracked100Percent) {
          this.#hasTracked100Percent = true;
          this.dispatchEvent(new Event('hundredPercent'));
        }
      };
      this.#audio.onended = () => {
        this.#isPlaying = false;
        this.#progress = 0;

        if (!this.#hasTracked100Percent && this.#currentTrack) {
          this.#hasTracked100Percent = true;
          this.dispatchEvent(new Event('hundredPercent'));
        }

        this.#hasTracked20Percent = false;
        this.#hasTracked100Percent = false;
        this.dispatchEvent(new Event('ended'));
      };
      this.#audio.onplaying = () => {
        this.#isPlaying = true;
        this.#startCumulativeTracking();
        this.dispatchEvent(new Event('play'));
      };
      this.#audio.onpause = () => {
        this.#isPlaying = false;
        this.#stopCumulativeTracking();
        this.dispatchEvent(new Event('pause'));
      };

      return () => {
        this.#stopCumulativeTracking();
        if (this.#audio) {
          this.#audio.src = '';
          this.#audio.load();
          this.#audio = null;
        }
      };
    });
  }

  /**
   * Creates a new player instance and sets it in the context.
   * @returns The new player instance.
   */
  static create() {
    return setContext(PLAYER_CONTEXT_KEY, new Player());
  }

  /**
   * Returns the player instance from the context.
   * @throws If no player instance is found.
   * @returns The player instance.
   */
  static get() {
    const context: Player | undefined = getContext(PLAYER_CONTEXT_KEY);
    if (!context) {
      throw new Error('Player context not found');
    }
    return context;
  }

  /**
   * Returns whether the player is currently playing.
   * @returns `true` if the player is playing, `false` otherwise.
   */
  get isPlaying() {
    return this.#isPlaying;
  }

  /**
   * Returns the currently loaded track metadata.
   * @returns The currently loaded track metadata, or `null` if no track is loaded.
   */
  get currentTrack() {
    return this.#currentTrack ? { ...this.#currentTrack } : null;
  }

  /**
   * Returns the total duration of the current track in seconds.
   */
  get duration() {
    return this.#duration;
  }

  /**
   * Returns the current playback position in seconds.
   */
  get progress() {
    return this.#progress;
  }

  /**
   * Returns the playback speed.
   */
  get playbackSpeed() {
    return PLAYBACK_SPEED_OPTIONS[this.#playbackSpeedIndex];
  }

  /**
   * Cycles through available playback speeds.
   */
  cyclePlaybackSpeed() {
    if (!browser || !this.#audio) {
      throw new OperationUnpermittedError();
    }

    this.#playbackSpeedIndex = (this.#playbackSpeedIndex + 1) % PLAYBACK_SPEED_OPTIONS.length;

    this.#audio.playbackRate = this.playbackSpeed;
  }

  /**
   * Plays the track with the specified metadata.
   * @param track - The track metadata.
   * @param initialSeekTime - Optional time in seconds to seek to after loading the track.
   */
  play(track: Track, initialSeekTime?: number) {
    if (!browser || !this.#audio) {
      throw new OperationUnpermittedError();
    }

    if (this.#audio.src !== track.url) {
      this.#audio.pause();

      // Load the new track metadata
      this.#audio.src = track.url;
      this.#audio.load();

      this.#currentTrack = track;
      this.#hasTracked20Percent = false;
      this.#hasTracked100Percent = false;

      if (initialSeekTime !== undefined && initialSeekTime > 0) {
        const seekToTime = () => {
          if (this.#audio && this.#duration > 0) {
            this.seek(initialSeekTime);
            this.#audio.removeEventListener('loadedmetadata', seekToTime);
          }
        };
        this.#audio.addEventListener('loadedmetadata', seekToTime);
      }
    }

    this.#audio.play();
  }

  /**
   * Seeks to the specified position in the current track.
   * @param time - The time in seconds to seek to.
   */
  seek(time: number) {
    if (!browser || !this.#audio) {
      throw new OperationUnpermittedError();
    }

    // Clamp `time` between 0 and the track's duration.
    this.#audio.currentTime = Math.max(0, Math.min(time, this.#duration));
  }

  /**
   * Skips backward by a specified amount of time.
   * @param seconds - The number of seconds to skip backward. Defaults to 10 seconds.
   */
  skipBack(seconds = 10) {
    if (!browser || !this.#audio) {
      throw new OperationUnpermittedError();
    }

    this.seek(this.#progress - seconds);
  }

  /**
   * Skips forward by a specified amount of time.
   * @param seconds - The number of seconds to skip forward. Defaults to 10 seconds.
   */
  skipForward(seconds = 10) {
    if (!browser || !this.#audio) {
      throw new OperationUnpermittedError();
    }

    this.seek(this.#progress + seconds);
  }

  /**
   * Toggles the playback state.
   */
  toggle() {
    if (!browser || !this.#audio) {
      throw new OperationUnpermittedError();
    }

    if (this.#isPlaying) {
      this.#audio.pause();
    } else {
      this.#audio.play();
    }
  }

  /**
   * Stops the playback and clears the current track.
   */
  stop() {
    if (!browser || !this.#audio) {
      throw new OperationUnpermittedError();
    }

    this.#audio.pause();
    this.#audio.src = '';
    this.#audio.load();

    this.#currentTrack = null;
  }

  /**
   * Start cumulative playtime tracking state
   */
  #startCumulativeTracking() {
    this.#stopCumulativeTracking();
    let lastTrackingTime = Date.now();

    this.#trackingTimer = window.setInterval(() => {
      if (!this.#isPlaying) {
        return;
      }

      const currentTime = Date.now();
      const timeSinceLastCheck = (currentTime - lastTrackingTime) / 1000;

      this.#cumulativePlayTime += timeSinceLastCheck;

      if (Math.round(this.#cumulativePlayTime) % 10 === 0) {
        this.dispatchEvent(new Event('checkpoint'));
      }

      lastTrackingTime = currentTime;
    }, 1000);
  }

  /**
   * Stops cumulative playtime tracking state
   */
  #stopCumulativeTracking() {
    if (!this.#trackingTimer) {
      return;
    }

    clearInterval(this.#trackingTimer);
    this.#trackingTimer = null;
  }
}

class OperationUnpermittedError extends Error {
  constructor() {
    super('This operation is not permitted outside the browser environment.');
  }
}
