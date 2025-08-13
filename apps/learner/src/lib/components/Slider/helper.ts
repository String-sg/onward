export const linearScaleValue = (
  value: number,
  input: [number, number],
  output: [number, number],
): number => {
  const [inputMin, inputMax] = input;
  const [outputMin, outputMax] = output;
  return ((value - inputMin) / (inputMax - inputMin)) * (outputMax - outputMin) + outputMin;
};

export const convertValueToSteps = (
  value: number,
  step: number,
  range: [number, number],
): number => {
  const [min, max] = range;
  const steps = Math.round((value - min) / step);
  return Math.min(max, Math.max(min, steps * step));
};

export const convertStepsToPercentage = (steps: number, range: [number, number]): number => {
  const [min, max] = range;
  return ((steps - min) / (max - min)) * 100;
};
