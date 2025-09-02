import { getContext, setContext } from 'svelte';

import { browser } from '$app/environment';

const PLAYER_CONTEXT_KEY = Symbol('Player');

export interface Track {
  id: number;
  tags: string[];
  title: string;
  url: string;
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
export class Player {
  static readonly PLAYBACK_SPEED_OPTIONS = [0.5, 1.0, 1.5, 2.0];

  #currentTrack = $state.raw<Track | null>(null);
  #isPlaying = $state(false);
  #duration = $state(0);
  #progress = $state(0);
  #playbackSpeedIndex = $state(1);

  #audio: HTMLAudioElement | null = null;

  constructor() {
    $effect(() => {
      this.#audio = new Audio();

      this.#audio.onloadedmetadata = () => {
        this.#duration = this.#audio?.duration || 0;
      };
      this.#audio.ontimeupdate = () => {
        this.#progress = this.#audio?.currentTime || 0;
      };
      this.#audio.onended = () => {
        this.#isPlaying = false;
        this.#progress = 0;
      };
      this.#audio.onplaying = () => {
        this.#isPlaying = true;
      };
      this.#audio.onpause = () => {
        this.#isPlaying = false;
      };

      return () => {
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
    return Player.PLAYBACK_SPEED_OPTIONS[this.#playbackSpeedIndex];
  }

  /**
   * Cycles through available playback speeds.
   */
  cyclePlaybackSpeed() {
    if (!browser || !this.#audio) {
      throw new OperationUnpermittedError();
    }

    this.#playbackSpeedIndex =
      (this.#playbackSpeedIndex + 1) % Player.PLAYBACK_SPEED_OPTIONS.length;

    if (this.#audio) {
      this.#audio.playbackRate = this.playbackSpeed;
    }
  }

  /**
   * Plays the track with the specified metadata.
   * @param track - The track metadata.
   */
  play(track: Track) {
    if (!browser || !this.#audio) {
      throw new OperationUnpermittedError();
    }

    if (this.#audio.src !== track.url) {
      this.#audio.pause();

      // Load the new track metadata
      this.#audio.src = track.url;
      this.#audio.load();
      this.#progress = 0;

      this.#currentTrack = track;
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
    const clampedTime = Math.max(0, Math.min(time, this.#duration));

    this.#audio.currentTime = clampedTime;
    this.#progress = clampedTime;
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
    this.#audio.currentTime = 0;

    this.#isPlaying = false;
    this.#currentTrack = null;
  }
}

class OperationUnpermittedError extends Error {
  constructor() {
    super('This operation is not permitted outside the browser environment.');
  }
}
