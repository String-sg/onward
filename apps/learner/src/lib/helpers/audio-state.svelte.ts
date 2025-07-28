import { getContext, setContext } from 'svelte';

const AUDIO_STATE_KEY = Symbol('AudioState');

export class AudioState {
  isPlaying = $state(false);

  static create() {
    setContext(AUDIO_STATE_KEY, new AudioState());
  }

  static load() {
    const context: AudioState | undefined = getContext(AUDIO_STATE_KEY);
    if (!context) {
      throw new Error('Audio state not found!');
    }

    return context;
  }
}
