import { getContext, setContext } from 'svelte';

const AUDIO_STATE_KEY = Symbol('AudioState');

interface LearningUnit {
  id: number;
  title: string;
}

/**
 * This class is used to store the audio state for the entire app.
 */
export class AudioState {
  #isPlaying = $state(false);
  #isFloatingPlayerVisible = $state(false);
  #currentLearningUnit = $state.raw<LearningUnit | null>(null);

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

  get currentLearningUnit() {
    return this.#currentLearningUnit;
  }

  get isPlaying() {
    return this.#isPlaying;
  }

  get isFloatingPlayerVisible() {
    return this.#isFloatingPlayerVisible;
  }

  /**
   * Starts playing a learning unit.
   */
  play(learningUnit: LearningUnit) {
    this.#currentLearningUnit = learningUnit;
    this.#isPlaying = true;
    this.#isFloatingPlayerVisible = true;
  }

  /**
   * Pauses the currently playing unit.
   */
  pause() {
    this.#isPlaying = false;
  }

  /**
   * Resumes playback of the current learning unit.
   */
  resume() {
    this.#isPlaying = true;
  }
}
