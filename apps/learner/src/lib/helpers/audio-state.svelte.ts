import { getContext, setContext } from 'svelte';

const AUDIO_STATE_KEY = Symbol('AudioState');

/**
 * This class is used to store the audio state for the entire app.
 */
export class AudioState {
  isPlaying = $state(false);
  isFloatingPlayerVisible = $state(false);

  /**
   * Set a new instance of the audio state in the context.
   */
  static create() {
    setContext(AUDIO_STATE_KEY, new AudioState());
  }

  /**
   * Loads the audio state from the context.
   * @returns The audio state.
   */
  static load() {
    const context: AudioState | undefined = getContext(AUDIO_STATE_KEY);
    if (!context) {
      throw new Error('Audio state not found!');
    }

    return context;
  }
}
