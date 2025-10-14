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

  // Load gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${env.PUBLIC_GOOGLE_ANALYTICS_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];

  window.gtag = (...args) => {
    window.dataLayer.push(args);
  };

  window.gtag('js', new Date());
  window.gtag('config', env.PUBLIC_GOOGLE_ANALYTICS_ID);
}

/**
 * Tracks when a podcast is played.
 * @param learningUnitId - The ID of the learning unit that was played.
 */
export function trackPodcastPlay(learningUnitId: bigint) {
  if (!browser) {
    return;
  }

  window.gtag('event', 'podcast_play', {
    learning_unit_id: learningUnitId,
  });
}
