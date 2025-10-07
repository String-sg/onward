/**
 * Formats a time value in seconds as a human-readable MM:SS string.
 *
 * @param seconds - The duration in seconds.
 * @returns The formatted time string, e.g. "3:07".
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
