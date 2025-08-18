/**
 * Maps a numeric value from one range to another using a linear scale.
 *
 * @param value - The input value to map.
 * @param input - The input range as a tuple [min, max].
 * @param output - The output range as a tuple [min, max].
 * @returns The mapped value in the output range.
 */
export function linearScaleValue(
  value: number,
  [inputMin, inputMax]: [number, number],
  [outputMin, outputMax]: [number, number],
): number {
  return ((value - inputMin) / (inputMax - inputMin)) * (outputMax - outputMin) + outputMin;
}

/**
 * Snaps a value to the nearest step within the given range and clamps the result.
 *
 * The value is rounded to the nearest multiple of `step` relative to `min`,
 * then clamped to the inclusive range [min, max].
 *
 * @param value - The value to snap.
 * @param step - The step size to snap to. Must be > 0.
 * @param range - The inclusive range as a tuple [min, max].
 * @returns The stepped and clamped value.
 */
export function convertValueToSteps(
  value: number,
  step: number,
  [min, max]: [number, number],
): number {
  return Math.min(max, Math.max(min, Math.round((value - min) / step) * step));
}

/**
 * Converts a stepped value into a percentage position within the given range.
 *
 * @param steps - The stepped value.
 * @param range - The inclusive range as a tuple [min, max].
 * @returns The percentage (0–100).
 */
export function convertStepsToPercentage(steps: number, [min, max]: [number, number]): number {
  return ((steps - min) / (max - min)) * 100;
}

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
