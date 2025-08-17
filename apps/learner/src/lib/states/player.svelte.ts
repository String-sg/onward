import { getContext, setContext } from 'svelte';

const PLAYER_CONTEXT_KEY = Symbol('Player');

export interface Track {
  id: number;
  title: string;
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
   * Plays the track with the specified metadata.
   * @param track - The track metadata.
   */
  play(track: Track) {
    this.#currentTrack = track;
    this.#isPlaying = true;
  }

  /**
   * Toggles the playback state.
   * If no track is loaded, this method does nothing.
   */
  toggle() {
    if (!this.#currentTrack) {
      return;
    }

    this.#isPlaying = !this.#isPlaying;
  }

  /**
   * Stops the playback and clears the current track.
   */
  stop() {
    this.#isPlaying = false;
    this.#currentTrack = null;
  }
}
