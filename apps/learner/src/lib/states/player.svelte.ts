import { getContext, setContext } from 'svelte';

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
  #isPlaying = $state(false);
  #currentTrack = $state.raw<Track | null>(null);
  #audio: HTMLAudioElement | null = null;
  #duration = $state(0);
  #progress = $state(0);

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
      throw new Error(`Player context not found`);
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
   * Plays the track with the specified metadata.
   * @param track - The track metadata.
   */
  play(track: Track) {
    // Stop current audio if playing
    if (this.#audio) {
      this.#audio.pause();
      this.#audio.currentTime = 0;
    }

    this.#currentTrack = track;

    // Load and play the new audio track
    this.#audio = new Audio(track.url);

    // Set up event listeners for duration and progress
    this.#audio.onloadedmetadata = () => {
      this.#duration = this.#audio?.duration || 0;
    };

    // Update progress as the track plays
    this.#audio.ontimeupdate = () => {
      this.#progress = this.#audio?.currentTime || 0;
    };

    // Reset progress when the track ends
    this.#audio.onended = () => {
      this.#isPlaying = false;
      this.#progress = 0;
    };

    this.#audio.play();
    this.#isPlaying = true;
  }

  /**
   * Sets the playback speed.
   * @param speed - The desired playback speed (e.g., 0.5, 1.0, 1.5, 2.0).
   */
  setSpeed(speed: number) {
    if (this.#audio) {
      this.#audio.playbackRate = speed;
    } else {
      console.warn('No audio loaded. Cannot set playback speed.');
    }
  }

  /**
   * Seeks to the specified position in the current track.
   * @param time - The time in seconds to seek to.
   */
  seek(time: number) {
    if (this.#audio && time >= 0 && time <= this.#duration) {
      this.#audio.currentTime = time;
      this.#progress = time;
    }
  }

  /**
   * Toggles the playback state.
   * If no track is loaded, this method does nothing.
   */
  toggle() {
    if (!this.#currentTrack || !this.#audio) {
      return;
    }

    if (this.#isPlaying) {
      this.#audio.pause();
    } else {
      this.#audio.play();
    }

    this.#isPlaying = !this.#isPlaying;
  }

  /**
   * Stops the playback and clears the current track.
   */
  stop() {
    if (this.#audio) {
      this.#audio.pause();
      this.#audio.currentTime = 0;
    }

    this.#isPlaying = false;
    this.#currentTrack = null;
  }
}
