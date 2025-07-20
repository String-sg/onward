import { WebAudioPlayer } from '../webAudioPlayer';

export type AudioStatus = 'idle' | 'loading' | 'playing' | 'paused';

/**
 * AudioPlayerStore - Reactive audio player state management for Svelte 5
 *
 * Manages audio playback state, progress tracking, and resume functionality.
 * Uses Svelte 5 $state for reactive updates and WebAudioPlayer for playback.
 *
 * @example
 * ```typescript
 * // Initialize with server data
 * audioPlayer.load(serverProgressData);
 *
 * // Play audio with resume support
 * await audioPlayer.playAudio(123, 'audio.mp3', 'Title', 30);
 *
 * // Get reactive values in components
 * let timeLeft = $derived(audioPlayer.getTimeLeft(123, 420));
 * let button = $derived(audioPlayer.getButtonState(123));
 * ```
 */

class AudioPlayerStore {
  private audioPlayer: WebAudioPlayer | null = null;

  /**
   * Active audio state - represents the currently playing/paused audio
   * Only one audio can be active at a time
   */
  activeAudio = $state<{
    learningUnitId: number | null;
    contentUrl: string | null;
    title: string | null;
    lastCheckpoint: number;
    duration: number;
    status: AudioStatus;
    progressPercent: number;
  }>({
    learningUnitId: null,
    contentUrl: null,
    title: null,
    lastCheckpoint: 0.0,
    duration: 0,
    status: 'idle',
    progressPercent: 0,
  });

  private timeUpdateInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Progress tracking for all audio units
   * Stores progress data with precomputed values for performance
   */
  audioProgress = $state<
    Record<
      number,
      {
        currentTime: number;
        completed: boolean;
        progressPercent: number;
        status: AudioStatus;
      }
    >
  >({});

  constructor() {
    // Initialize audio player only on client side
    if (typeof window !== 'undefined') {
      this.audioPlayer = new WebAudioPlayer();
    }

    // Start time updates manually
    this.startTimeUpdates();
  }

  /**
   * Load progress data into store from server
   * Hydrates the client-side store with server-side progress data
   *
   * @param audioProgressData - Array of audio progress records from server
   * @example
   * ```typescript
   * audioPlayer.load([
   *   { learningUnitId: 123, currentTime: 45, completed: false, duration: 180 }
   * ]);
   * ```
   */
  load(
    audioProgressData: {
      learningUnitId: number;
      currentTime: number;
      completed: boolean;
      duration?: number;
    }[],
  ) {
    audioProgressData.forEach((progress) => {
      this.audioProgress[progress.learningUnitId] = this.createProgressData(
        progress.currentTime,
        progress.completed,
        progress.duration,
      );
    });
  }

  /**
   * Get formatted time remaining for an audio unit
   * Returns calculated time left based on current progress
   *
   * @param learningUnitId - ID of the audio unit
   * @param serverDuration - Optional server-provided duration as fallback
   * @returns Formatted time string (e.g., "5m left", "30s left")
   */
  getTimeLeft(learningUnitId: number, serverDuration?: number): string {
    if (this.activeAudio.learningUnitId === learningUnitId) {
      // Calculate from active audio data
      if (this.activeAudio.duration > 0) {
        const remaining = this.activeAudio.duration - this.activeAudio.lastCheckpoint;
        return `${this.formatTime(remaining)} left`;
      }
      return '0m left';
    } else {
      // Calculate from stored progress
      const progress = this.audioProgress[learningUnitId];

      if (progress?.completed && serverDuration && serverDuration > 0) {
        return `${this.formatTime(serverDuration)} left`;
      }

      if (progress?.currentTime > 0 && serverDuration && serverDuration > 0) {
        const remaining = serverDuration - progress.currentTime;
        return `${this.formatTime(remaining)} left`;
      }
      if (serverDuration && serverDuration > 0 && this.audioProgress[learningUnitId]) {
        return `${this.formatTime(serverDuration)} left`;
      }
      return '0m left';
    }
  }

  /**
   * Get progress percentage for an audio unit
   * Returns completion percentage (0-100) based on current progress
   *
   * @param learningUnitId - ID of the audio unit
   * @param serverDuration - Optional server-provided duration as fallback
   * @returns Progress percentage (0-100)
   */
  getProgressPercent(learningUnitId: number, serverDuration?: number): number {
    if (this.activeAudio.learningUnitId === learningUnitId) {
      return this.activeAudio.progressPercent;
    } else {
      const progress = this.audioProgress[learningUnitId];

      if (progress?.completed) {
        return 0;
      }

      if (progress?.progressPercent) {
        return progress.progressPercent;
      }
      // Fallback calculation for inactive audio
      if (progress?.currentTime && serverDuration && serverDuration > 0) {
        return (progress.currentTime / serverDuration) * 100;
      }
      return 0;
    }
  }

  /**
   * Get button state for an audio unit
   * Returns appropriate button text and icon state based on audio status
   *
   * @param learningUnitId - ID of the audio unit
   * @returns Object with button text and showPause flag
   */
  getButtonState(learningUnitId: number): { text: string; showPause: boolean } {
    const isActive = this.activeAudio.learningUnitId === learningUnitId;
    const progress = this.audioProgress[learningUnitId] || {
      currentTime: 0,
      completed: false,
      status: 'idle' as AudioStatus,
    };

    if (isActive) {
      const isPlaying = this.activeAudio.status === 'playing';
      const hasProgress = this.activeAudio.lastCheckpoint > 0;

      if (isPlaying) {
        return { text: 'Pause', showPause: true };
      }
      if (hasProgress && this.activeAudio.status === 'paused') {
        return { text: 'Resume', showPause: false };
      }
    } else {
      if (progress.completed) {
        return { text: 'Play', showPause: false };
      }
      if (progress.currentTime > 0) {
        return { text: 'Resume', showPause: false };
      }
    }

    return { text: 'Play', showPause: false };
  }

  /**
   * Check if an audio unit is currently playing
   * @param learningUnitId - ID of the audio unit to check
   * @returns True if the audio is currently active and playing
   */
  isCurrentlyPlaying(learningUnitId: number): boolean {
    return (
      this.activeAudio.learningUnitId === learningUnitId &&
      (this.audioPlayer?.getIsPlaying() ?? false)
    );
  }

  /**
   * Get resume time for an audio unit
   * Returns the time position where audio should resume from
   *
   * @param learningUnitId - ID of the audio unit
   * @param serverProgress - Optional server progress data as fallback
   * @returns Resume time in seconds
   */
  getResumeTime(
    learningUnitId: number,
    serverProgress?: { lastCheckpoint: number; isCompleted: boolean },
  ): number {
    const progress = this.audioProgress[learningUnitId];

    if (progress?.completed) {
      return 0;
    }

    if (progress?.currentTime && progress.currentTime > 0) {
      return progress.currentTime;
    }

    if (serverProgress?.isCompleted) {
      return 0;
    }

    if (serverProgress?.lastCheckpoint && serverProgress.lastCheckpoint > 0) {
      return serverProgress.lastCheckpoint;
    }

    return 0;
  }

  /**
   * Format seconds into human-readable time string
   * @param seconds - Time in seconds
   * @returns Formatted string (e.g., "5m", "30s")
   */
  private formatTime(seconds: number): string {
    if (seconds <= 0) return '0m';

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (minutes === 0) {
      return `${remainingSeconds}s`;
    } else {
      return `${minutes}m`;
    }
  }

  /**
   * Create progress data object with computed values
   * Helper method to create consistent progress data structure
   *
   * @param currentTime - Current playback position in seconds
   * @param completed - Whether the audio is completed
   * @param duration - Optional duration for progress percentage calculation
   * @returns Progress data object with computed values
   */
  private createProgressData(currentTime: number, completed: boolean, duration?: number) {
    const progressPercent = duration && duration > 0 ? (currentTime / duration) * 100 : 0;

    const status: AudioStatus = completed ? 'idle' : currentTime > 0 ? 'paused' : 'idle';

    return {
      currentTime,
      completed,
      progressPercent,
      status,
    };
  }

  /**
   * Start periodic time updates for active audio
   * Updates progress, duration, and state every 100ms while playing
   */
  private startTimeUpdates() {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
    }

    this.timeUpdateInterval = setInterval(() => {
      if (this.audioPlayer?.getIsPlaying()) {
        const currentTime = this.audioPlayer.getCurrentTime() ?? 0;
        const duration = this.audioPlayer.getDuration() ?? 0;

        // Check if audio has completed (within 1 second of end)
        const isCompleted = duration > 0 && currentTime >= duration - 1;

        if (isCompleted) {
          this.handleAudioCompletion();
          return;
        }

        this.activeAudio.lastCheckpoint = currentTime;
        this.activeAudio.duration = duration;

        if (this.activeAudio.duration > 0) {
          this.activeAudio.progressPercent =
            (this.activeAudio.lastCheckpoint / this.activeAudio.duration) * 100;
        } else {
          this.activeAudio.progressPercent = 0;
        }
        this.activeAudio.status = 'playing';

        if (this.activeAudio.learningUnitId) {
          this.audioProgress[this.activeAudio.learningUnitId] = this.createProgressData(
            currentTime,
            false,
            duration,
          );
        }
      }
    }, 100);
  }

  /**
   * Handle audio completion
   * Resets audio to beginning, marks as completed, updates button state
   * @private
   */
  private handleAudioCompletion() {
    if (!this.activeAudio.learningUnitId || !this.audioPlayer) return;

    const learningUnitId = this.activeAudio.learningUnitId;
    const duration = this.activeAudio.duration;

    this.audioPlayer.pause();

    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
      this.timeUpdateInterval = null;
    }

    // Reset active audio to beginning (ready for replay)
    this.activeAudio.lastCheckpoint = 0;
    this.activeAudio.progressPercent = 0;
    this.activeAudio.status = 'idle';

    this.audioProgress[learningUnitId] = this.createProgressData(0, true, duration);
  }

  /**
   * Play audio with optional resume functionality
   * Handles switching between audio files and resuming from saved positions
   *
   * @param learningUnitId - Unique identifier for the audio unit
   * @param contentUrl - URL of the audio file to play
   * @param title - Optional display title for the audio
   * @param resumeTime - Optional specific time to start from (overrides saved progress)
   *
   * @example
   * ```typescript
   * // Play from beginning
   * await audioPlayer.playAudio(123, 'audio.mp3', 'Lesson 1');
   *
   * // Resume from saved position
   * await audioPlayer.playAudio(123, 'audio.mp3', 'Lesson 1');
   *
   * // Play from specific time
   * await audioPlayer.playAudio(123, 'audio.mp3', 'Lesson 1', 30);
   * ```
   */
  async playAudio(learningUnitId: number, contentUrl: string, title?: string, resumeTime?: number) {
    // Stop timer updates first to prevent race conditions
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
      this.timeUpdateInterval = null;
    }

    // Save current progress if switching to a different audio
    const currentlyPlayingId = this.activeAudio.learningUnitId;
    if (currentlyPlayingId && currentlyPlayingId !== learningUnitId) {
      const currentTime = this.audioPlayer?.getIsPlaying()
        ? (this.audioPlayer.getCurrentTime() ?? 0)
        : this.activeAudio.lastCheckpoint;

      this.audioProgress[currentlyPlayingId] = this.createProgressData(currentTime, false);
      this.audioPlayer?.pause();
    }

    let actualResumeTime = 0;

    if (resumeTime !== undefined) {
      actualResumeTime = resumeTime;
    } else {
      // Check stored progress first
      const storedProgress = this.audioProgress[learningUnitId];

      // If audio is completed, start from beginning (don't use stored currentTime)
      if (storedProgress?.completed) {
        actualResumeTime = 0;
      } else if (storedProgress?.currentTime > 0) {
        actualResumeTime = storedProgress.currentTime;
      } else if (
        this.activeAudio.learningUnitId === learningUnitId &&
        this.activeAudio.lastCheckpoint > 0
      ) {
        // If resuming the same audio, use lastCheckpoint
        actualResumeTime = this.activeAudio.lastCheckpoint;
      }
    }

    // Load new audio if needed (different content URL)
    if (this.activeAudio.contentUrl !== contentUrl) {
      await this.audioPlayer?.loadAudio(contentUrl);
    }

    // Start playing from the resume time
    this.audioPlayer?.play(actualResumeTime);

    // Update state
    this.activeAudio = {
      learningUnitId,
      contentUrl,
      title: title || null,
      duration: this.audioPlayer?.getDuration() || 0,
      lastCheckpoint: actualResumeTime,
      status: 'playing',
      progressPercent: 0,
    };

    // Update computed values immediately
    if (this.activeAudio.duration > 0) {
      this.activeAudio.progressPercent =
        (this.activeAudio.lastCheckpoint / this.activeAudio.duration) * 100;
    } else {
      this.activeAudio.progressPercent = 0;
    }
    this.activeAudio.status = 'playing';

    // Start timer updates after everything is set up
    this.startTimeUpdates();
  }

  /**
   * Pause the currently playing audio
   * Stops playback and saves current progress
   */
  pauseAudio() {
    if (!this.audioPlayer) return;

    const learningUnitId = this.activeAudio.learningUnitId;
    if (!learningUnitId) return;

    // Get current time before pausing (more reliable)
    const currentTime = this.audioPlayer.getIsPlaying()
      ? (this.audioPlayer.getCurrentTime() ?? 0)
      : this.activeAudio.lastCheckpoint; // Use stored checkpoint if not playing

    this.audioPlayer.pause();

    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
      this.timeUpdateInterval = null;
    }

    // Update state and save progress
    this.activeAudio.lastCheckpoint = currentTime;
    this.audioProgress[learningUnitId] = this.createProgressData(
      currentTime,
      this.activeAudio.duration > 0 && currentTime >= this.activeAudio.duration - 1,
      this.activeAudio.duration,
    );

    // Update computed values for active audio
    if (this.activeAudio.duration > 0) {
      this.activeAudio.progressPercent =
        (this.activeAudio.lastCheckpoint / this.activeAudio.duration) * 100;
    } else {
      this.activeAudio.progressPercent = 0;
    }
    this.activeAudio.status = 'paused';
  }
}

export const audioPlayer = new AudioPlayerStore();
