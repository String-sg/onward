import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';

declare global {
  interface Window {
    gtag: (command: string, ...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

/**
 * Initialises the Google Analytics script.
 */
export function initAnalytics() {
  if (!browser) {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${env.PUBLIC_GOOGLE_ANALYTICS_ID}`;
  document.head.appendChild(script);

  window.gtag('js', new Date());
  window.gtag('config', env.PUBLIC_GOOGLE_ANALYTICS_ID);
}

/**
 * Tracks when a podcast is played.
 * @param learningUnitId - The ID of the learning unit that was played.
 */
export function trackPodcastPlay(learningUnitId: string) {
  if (!browser) {
    return;
  }

  window.gtag('event', 'podcast_play', {
    learning_unit_id: learningUnitId,
  });
}

/**
 * Tracks when a podcast is played at 20% completion.
 * @param learningUnitId - The ID of the learning unit that was played.
 */
export function track20PercentPodcastPlay(learningUnitId: string) {
  if (!browser) {
    return;
  }

  window.gtag('event', 'podcast_play_20_percent', {
    learning_unit_id: learningUnitId,
  });
}

/**
 * Tracks when a podcast is played at 50% completion.
 * @param learningUnitId - The ID of the learning unit that was played.
 */
export function track50PercentPodcastPlay(learningUnitId: string) {
  if (!browser) {
    return;
  }

  window.gtag('event', 'podcast_play_50_percent', {
    learning_unit_id: learningUnitId,
  });
}

/**
 * Tracks when a podcast is played at 80% completion.
 * @param learningUnitId - The ID of the learning unit that was played.
 */
export function track80PercentPodcastPlay(learningUnitId: string) {
  if (!browser) {
    return;
  }

  window.gtag('event', 'podcast_play_80_percent', {
    learning_unit_id: learningUnitId,
  });
}

/**
 * Tracks when the AI chat is clicked.
 */
export function trackAIChatClick() {
  if (!browser) {
    return;
  }

  window.gtag('event', 'ai_chat_click');
}

/**
 * Tracks when the Now Playing Bar is clicked.
 */
export function trackNowPlayingBarClick(learning_unit_id: string) {
  if (!browser) {
    return;
  }

  window.gtag('event', 'now_playing_bar_click', { learning_unit_id });
}

/**
 * Tracks when a podcast is completed (100%).
 * @param learningUnitId - The ID of the learning unit that was completed.
 */
export function trackPodcastCompletion(learningUnitId: string) {
  if (!browser) {
    return;
  }

  window.gtag('event', 'podcast_completion', {
    learning_unit_id: learningUnitId,
  });
}

/**
 * Tracks when the quiz is clicked.
 * @param learningUnitId - The ID of the learning unit of the quiz.
 */
export function trackQuizClick(learningUnitId: string) {
  if (!browser) {
    return;
  }

  window.gtag('event', 'quiz_click', {
    learning_unit_id: learningUnitId,
  });
}

/**
 * Tracks when the quiz is attempted.
 * @param learningUnitId - The ID of the learning unit of the quiz.
 * @param questionId - The ID of the question being attempted.
 */
export function trackQuizAttempt(learningUnitId: string, questionId: string) {
  if (!browser) {
    return;
  }

  window.gtag('event', 'quiz_attempt', {
    learning_unit_id: learningUnitId,
    question_id: questionId,
  });
}

/**
 * Tracks quiz completion events when a user finishes a quiz.
 * @param learningUnitId - The ID of the learning unit associated with the quiz.
 */
export function trackQuizCompletion(learningUnitId: string) {
  if (!browser) {
    return;
  }

  window.gtag('event', 'quiz_completion', {
    learning_unit_id: learningUnitId,
  });
}

/**
 * Tracks when the sources is clicked.
 * @param learningUnitId - The ID of the learning unit associated with the sources.
 */
export function trackSourcesClick(learningUnitId: string) {
  if (!browser) {
    return;
  }

  window.gtag('event', 'sources_click', {
    learning_unit_id: learningUnitId,
  });
}

/**
 * Tracks when the profile is clicked.
 */
export function trackProfileClick() {
  if (!browser) {
    return;
  }

  window.gtag('event', 'profile_click');
}
