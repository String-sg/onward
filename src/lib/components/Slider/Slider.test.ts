import { render, waitFor } from '@testing-library/svelte';
import { describe, expect, test, vi } from 'vitest';

import { convertStepsToPercentage, convertValueToSteps, linearScaleValue } from './helper.js';
import { Slider } from './index.js';

describe('linearScaleValue', () => {
  test('maps value from one range to another', () => {
    expect(linearScaleValue(50, [0, 100], [0, 1])).toBe(0.5);
  });

  test('maps value at input minimum to output minimum', () => {
    expect(linearScaleValue(0, [0, 100], [0, 200])).toBe(0);
  });

  test('maps value at input maximum to output maximum', () => {
    expect(linearScaleValue(100, [0, 100], [0, 200])).toBe(200);
  });

  test('handles negative ranges', () => {
    expect(linearScaleValue(0, [-100, 100], [0, 100])).toBe(50);
  });

  test('handles inverted output range', () => {
    expect(linearScaleValue(25, [0, 100], [100, 0])).toBe(75);
  });
});

describe('convertValueToSteps', () => {
  test('snaps value to nearest step', () => {
    expect(convertValueToSteps(7, 5, [0, 100])).toBe(5);
    expect(convertValueToSteps(8, 5, [0, 100])).toBe(10);
  });

  test('clamps value to minimum', () => {
    expect(convertValueToSteps(-10, 1, [0, 100])).toBe(0);
  });

  test('clamps value to maximum', () => {
    expect(convertValueToSteps(150, 1, [0, 100])).toBe(100);
  });

  test('handles step of 1', () => {
    expect(convertValueToSteps(50.4, 1, [0, 100])).toBe(50);
    expect(convertValueToSteps(50.6, 1, [0, 100])).toBe(51);
  });

  test('handles decimal steps', () => {
    expect(convertValueToSteps(0.16, 0.1, [0, 1])).toBeCloseTo(0.2, 10);
  });
});

describe('convertStepsToPercentage', () => {
  test('converts stepped value to percentage', () => {
    expect(convertStepsToPercentage(50, [0, 100])).toBe(50);
  });

  test('returns 0 for minimum value', () => {
    expect(convertStepsToPercentage(0, [0, 100])).toBe(0);
  });

  test('returns 100 for maximum value', () => {
    expect(convertStepsToPercentage(100, [0, 100])).toBe(100);
  });

  test('handles non-zero minimum', () => {
    expect(convertStepsToPercentage(50, [0, 200])).toBe(25);
    expect(convertStepsToPercentage(150, [100, 200])).toBe(50);
  });
});

describe('Slider', () => {
  const getThumb = (container: HTMLElement) => container.querySelector('[style*="left:"]');

  test('renders slider element', () => {
    const { container } = render(Slider);
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  test('renders with default props', async () => {
    const { container } = render(Slider);

    await waitFor(() => {
      const thumb = getThumb(container);
      expect(thumb?.getAttribute('style')).toContain('left: 0%');
    });
  });

  test('renders with initial value', async () => {
    const { container } = render(Slider, { props: { value: 50, min: 0, max: 100 } });
    await waitFor(() => {
      const thumb = getThumb(container);
      expect(thumb?.getAttribute('style')).toContain('left: 50%');
    });
  });

  test('renders with custom min/max range', async () => {
    const { container } = render(Slider, { props: { value: 50, min: 0, max: 200 } });

    await waitFor(() => {
      const thumb = getThumb(container);
      expect(thumb?.getAttribute('style')).toContain('left: 25%');
    });
  });

  test('updates thumb position when value prop changes', async () => {
    const { container, rerender } = render(Slider, { props: { value: 0 } });

    await waitFor(() => {
      const thumb = getThumb(container);
      expect(thumb?.getAttribute('style')).toContain('left: 0%');
    });

    await rerender({ value: 75 });

    await waitFor(() => {
      const thumb = getThumb(container);
      expect(thumb?.getAttribute('style')).toContain('left: 75%');
    });
  });

  test('calls onvaluechange when pointer interaction occurs', async () => {
    const onvaluechange = vi.fn();
    const { container } = render(Slider, {
      props: { onvaluechange, min: 0, max: 100 },
    });

    const slider = container.querySelector('div');
    if (!slider) throw new Error('Slider not found');

    vi.spyOn(slider, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      right: 100,
      top: 0,
      bottom: 10,
      width: 100,
      height: 10,
      x: 0,
      y: 0,
      toJSON: () => {
        return this;
      },
    });

    const pointerDownEvent = new PointerEvent('pointerdown', {
      clientX: 50,
      bubbles: true,
      pointerId: 1,
    });

    slider.setPointerCapture = vi.fn();
    slider.dispatchEvent(pointerDownEvent);

    expect(onvaluechange).toHaveBeenCalledWith(50);
  });

  test('respects step value when calculating position', async () => {
    const onvaluechange = vi.fn();
    const { container } = render(Slider, {
      props: { onvaluechange, min: 0, max: 100, step: 10 },
    });

    const slider = container.querySelector('div');
    if (!slider) throw new Error('Slider not found');

    vi.spyOn(slider, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      right: 100,
      top: 0,
      bottom: 10,
      width: 100,
      height: 10,
      x: 0,
      y: 0,
      toJSON: () => {
        return this;
      },
    });

    slider.setPointerCapture = vi.fn();

    const pointerDownEvent = new PointerEvent('pointerdown', {
      clientX: 47,
      bubbles: true,
      pointerId: 1,
    });
    slider.dispatchEvent(pointerDownEvent);

    expect(onvaluechange).toHaveBeenCalledWith(50);
  });
});
