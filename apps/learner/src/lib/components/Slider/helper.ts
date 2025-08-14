// Maps a value from one range to another.
export const linearScaleValue = (
  value: number,
  [inputMin, inputMax]: [number, number],
  [outputMin, outputMax]: [number, number],
): number => ((value - inputMin) / (inputMax - inputMin)) * (outputMax - outputMin) + outputMin;

// Snaps a value to the nearest step within the specified range.
export const convertValueToSteps = (
  value: number,
  step: number,
  [min, max]: [number, number],
): number => Math.min(max, Math.max(min, Math.round((value - min) / step) * step));

// Converts the current step position into a percentage.
export const convertStepsToPercentage = (steps: number, [min, max]: [number, number]): number =>
  ((steps - min) / (max - min)) * 100;

// Converts a time value in seconds to a string formatted as MM:SS.
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};
