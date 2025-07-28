/**
 * Tracks if an element is within the current viewport.
 *
 * @param target - A function that returns the element to track.
 * @param initialState - The initial state of whether the element is within the viewport. Defaults to `true`.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 * let target = $state<HTMLElement | null>(null);
 *
 * const isWithinViewport = useIsWithinViewport(() => target);
 * </script>
 *
 * <span bind:this={target}>Hello world!</span>
 * <span>Is within viewport: {isWithinViewport.current ? 'Yes' : 'No'}</span>
 * ```
 */
export function useIsWithinViewport(target: () => HTMLElement | null, initialState = true) {
  let isWithinViewport = $state(initialState);
  let observer: IntersectionObserver | null = null;

  $effect(() => {
    observer = new IntersectionObserver(([entry]) => {
      isWithinViewport = entry.isIntersecting;
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

  return {
    get current() {
      return isWithinViewport;
    },
  };
}
