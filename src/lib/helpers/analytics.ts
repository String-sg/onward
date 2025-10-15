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
 */
export function trackQuizAttempt(learningUnitId: string) {
  if (!browser) {
    return;
  }

  window.gtag('event', 'quiz_attempt', {
    learning_unit_id: learningUnitId,
  });
}

/**
 * Tracks when the quiz is completed.
 * @param learningUnitId - The ID of the learning unit of the quiz.
 */
export function trackQuizCompletion(learningUnitId: string) {
  if (!browser) {
    return;
  }

  window.gtag('event', 'quiz_completion', {
    learning_unit_id: learningUnitId,
  });
}
