/**
 * WebAudioPlayer - A clean, efficient Web Audio API player
 *
 * Usage:
 * ```typescript
 * const player = new WebAudioPlayer();
 * await player.loadAudio('audio.mp3');
 * player.play(startTime); // Optional start time
 * player.pause();
 * ```
 */
export class WebAudioPlayer {
  private readonly audioContext: AudioContext;
  private readonly gainNode: GainNode;

  private audioBuffer: AudioBuffer | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;

  private isPlaying = false;
  private startTime = 0;
  private pauseTime = 0;

  private currentUrl: string | null = null;
  private loadingPromise: Promise<void> | null = null;

  constructor() {
    // Initialize Web Audio API context
    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext!;
    this.audioContext = new AudioContextClass();

    // Create and connect gain node for volume control
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
  }

  /**
   * Load an audio file from URL
   * Won't reload if same URL is already loaded
   */
  async loadAudio(url: string): Promise<void> {
    if (this.currentUrl === url && this.audioBuffer) return;

    if (this.loadingPromise && this.currentUrl === url) {
      return this.loadingPromise;
    }

    this.currentUrl = url;
    this.loadingPromise = (async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to fetch ${url}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      } catch (error) {
        throw error instanceof Error ? error : new Error(String(error));
      }
    })();

    try {
      await this.loadingPromise;
    } finally {
      this.loadingPromise = null;
    }
  }

  /**
   * Start playback from specified time
   */
  play(resumeTime?: number): void {
    if (this.isPlaying || !this.audioBuffer) return;

    const startPosition = resumeTime ?? this.pauseTime;

    this.stopSource();

    this.sourceNode = this.audioContext.createBufferSource();
    this.sourceNode.buffer = this.audioBuffer;
    this.sourceNode.connect(this.gainNode);

    this.startTime = this.audioContext.currentTime - startPosition;
    this.isPlaying = true;
    this.sourceNode.start(0, startPosition);

    this.sourceNode.onended = () => {
      this.isPlaying = false;
      this.pauseTime = 0;
    };
  }

  /**
   * Pause playback and remember position
   */
  pause(): void {
    if (!this.isPlaying) return;

    this.pauseTime = this.audioContext.currentTime - this.startTime;
    this.stopSource();
    this.isPlaying = false;
  }

  /**
   * Get total audio duration (0 if not loaded)
   */
  getDuration(): number {
    return this.audioBuffer?.duration ?? 0;
  }

  /**
   * Get current playback position
   */
  getCurrentTime(): number {
    if (this.isPlaying) {
      return this.audioContext.currentTime - this.startTime;
    }
    return this.pauseTime;
  }

  /**
   * Check if audio is currently playing
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
  }

  private stopSource(): void {
    if (this.sourceNode) {
      try {
        this.sourceNode.stop();
        this.sourceNode.disconnect();
      } catch {
        // Source might already be stopped
      }
      this.sourceNode = null;
    }
  }
}
