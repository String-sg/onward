<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  type Props = HTMLAttributes<SVGSVGElement>;

  let { class: clazz, ...otherProps }: Props = $props();

  const stars = [
    { x: 112.3, y: 58.4, scale: 0.52, duration: 4.27 },
    { x: 268.9, y: 132.7, scale: 1.43, duration: 3.46 },
    { x: 389.6, y: 72.8, scale: 1.36, duration: 3.95 },
    { x: 532.1, y: 149.2, scale: 1.55, duration: 3.58 },
    { x: 678.5, y: 84.1, scale: 1.76, duration: 2.01 },
    { x: 818.2, y: 132.4, scale: 1.41, duration: 1.28 },
    { x: 953.7, y: 64.9, scale: 0.98, duration: 3.56 },
    { x: 86.4, y: 214.6, scale: 0.97, duration: 2.32 },
    { x: 231.7, y: 268.8, scale: 1.7, duration: 5.45 },
    { x: 378.2, y: 192.3, scale: 1.39, duration: 5.87 },
    { x: 522.5, y: 246.1, scale: 1.26, duration: 2.54 },
    { x: 667.4, y: 191.5, scale: 1.63, duration: 4.23 },
    { x: 812.9, y: 245.7, scale: 1.21, duration: 3.23 },
    { x: 957.6, y: 206.4, scale: 1.92, duration: 1.47 },
    { x: 142.1, y: 333.9, scale: 1.74, duration: 1.35 },
    { x: 291.8, y: 302.1, scale: 1.57, duration: 4.28 },
    { x: 438.3, y: 357.8, scale: 1.96, duration: 1.7 },
    { x: 585.1, y: 318.6, scale: 1.69, duration: 3.91 },
    { x: 732.7, y: 366.9, scale: 1.4, duration: 1.11 },
    { x: 879.4, y: 327.4, scale: 1.89, duration: 4.93 },
    { x: 110.6, y: 445.8, scale: 0.94, duration: 3.13 },
    { x: 257.3, y: 405.1, scale: 0.96, duration: 4.07 },
    { x: 404.7, y: 466.2, scale: 0.56, duration: 2.23 },
    { x: 552.9, y: 421.7, scale: 1.57, duration: 1.73 },
    { x: 699.6, y: 478.3, scale: 1.41, duration: 4.68 },
    { x: 847.2, y: 436.5, scale: 1.72, duration: 5.99 },
    { x: 990.4, y: 494.7, scale: 1.27, duration: 2.62 },
    { x: 156.2, y: 567.1, scale: 1.0, duration: 2.5 },
    { x: 302.4, y: 520.3, scale: 0.83, duration: 1.44 },
    { x: 448.6, y: 582.9, scale: 1.8, duration: 4.18 },
    { x: 596.3, y: 536.7, scale: 1.98, duration: 4.92 },
    { x: 743.8, y: 597.2, scale: 1.64, duration: 3.22 },
    { x: 891.5, y: 550.4, scale: 1.58, duration: 2.26 },
    { x: 1009.7, y: 590.1, scale: 1.93, duration: 5.3 },
    { x: 54.7, y: 360.2, scale: 1.87, duration: 4.24 },
    { x: 24.3, y: 252.8, scale: 0.59, duration: 4.96 },
    { x: 973.4, y: 279.5, scale: 1.15, duration: 2.97 },
    { x: 39.5, y: 100.3, scale: 0.96, duration: 1.05 },
    { x: 920.6, y: 33.7, scale: 1.87, duration: 5.95 },
    { x: 64.2, y: 480.9, scale: 1.11, duration: 1.94 },
  ];
</script>

<svg
  class={[
    'pointer-events-none absolute inset-0 -z-1 mx-auto min-h-svh w-full max-w-5xl px-4 py-3',
    clazz,
  ]}
  {...otherProps}
>
  <defs>
    <path
      id="star"
      d="M-1.74846e-07 4C-1.74846e-07 4 2.28237 3.98544 3.13391 3.13391C3.98544 2.28237 4 -1.06686e-07 4 -1.06686e-07C4 -1.06686e-07 4.0217 2.27524 4.87323 3.12677C5.72476 3.9783 8 4 8 4C8 4 5.74043 4.03736 4.88889 4.88889C4.03736 5.74043 4 8 4 8C4 8 4.00111 5.70195 3.14958 4.85042C2.29805 3.99889 -1.74846e-07 4 -1.74846e-07 4Z"
      fill="currentColor"
    />
  </defs>
  <g id="stars">
    {#each stars as star (star)}
      <use href="#star" transform="translate({star.x},{star.y}) scale({star.scale})">
        <animate
          attributeName="opacity"
          values="0;1;0"
          repeatCount="indefinite"
          dur={star.duration}
        >
        </animate>
      </use>
    {/each}
  </g>
</svg>
