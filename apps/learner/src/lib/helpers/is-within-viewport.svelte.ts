/**
 * Tracks if an element is within the current viewport.
 *
 * @param target - A function that returns the element to track.
 * @param initialState - The initial state of whether the element is within the viewport. Defaults to `true`.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 * import { IsWithinViewport } from '$lib/helpers/index.js';
 *
 * let target = $state<HTMLElement | null>(null);
 *
 * const isWithinViewport = new IsWithinViewport(() => target);
 * </script>
 *
 * <span bind:this={target}>Hello world!</span>
 * <span>Is within viewport: {isWithinViewport.current ? 'Yes' : 'No'}</span>
 * ```
 */
export class IsWithinViewport {
  #isWithinViewport = $state(true);
  #observer: IntersectionObserver | null = null;

  constructor(target: () => HTMLElement | null, initialState = true) {
    this.#isWithinViewport = initialState;

    $effect(() => {
      this.#observer = new IntersectionObserver(([entry]) => {
        this.#isWithinViewport = entry.isIntersecting;
      });

      const element = target();
      if (element) {
        this.#observer.observe(element);
      }

      return () => {
        if (this.#observer) {
          this.#observer.disconnect();
        }
      };
    });
  }

  /**
   * Returns the current state of whether the element is within the viewport.
   */
  get current() {
    return this.#isWithinViewport;
  }
}
