import { getContext, setContext } from 'svelte';

const AUDIO_STATE_KEY = Symbol('AudioState');

/**
 * This class is used to store the audio state for the entire app.
 */
export class AudioState {
  learningUnitId = $state<number | null>(null);
  isPlaying = $state(false);
  isFloatingPlayerVisible = $state(false);

  /**
   * Checks if a specific learning unit is currently playing.
   * @param learningUnitId - The ID of the learning unit to check
   * @returns True if the specified unit is currently playing, false otherwise
   */
  isUnitPlaying(learningUnitId: number): boolean {
    return this.isPlaying && this.learningUnitId === learningUnitId;
  }

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
