/**
 * Tracks if an element is within the current viewport.
 *
 * @example
 * ```svelte
 * <script lang="ts">
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
  #isWithinViewport = $state(false);

  constructor(target: () => HTMLElement | null) {
    let observer: IntersectionObserver | null = null;

    $effect(() => {
      observer = new IntersectionObserver(([entry]) => {
        this.#isWithinViewport = entry.isIntersecting;
      });

      const element = target();
      if (element) {
        observer.observe(element);
      }

      return () => {
        if (observer) {
          observer.disconnect();
        }
      };
    });
  }

  /**
   * Returns `true` if the target element is within the current viewport, `false` otherwise.
   */
  get current() {
    return this.#isWithinViewport;
  }
}
