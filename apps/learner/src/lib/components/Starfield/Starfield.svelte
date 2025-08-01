<script lang="ts">
  const stars = [
    { x: 677.27, y: 422.37, scale: 0.52, duration: 4.27 },
    { x: 192.12, y: 298.72, scale: 1.43, duration: 3.46 },
    { x: 490.38, y: 332.94, scale: 1.36, duration: 3.95 },
    { x: 422.91, y: 193.58, scale: 1.55, duration: 3.58 },
    { x: 278.94, y: 140.45, scale: 1.76, duration: 2.01 },
    { x: 350.74, y: 366.57, scale: 1.41, duration: 1.28 },
    { x: 957.24, y: 262.47, scale: 0.98, duration: 3.56 },
    { x: 45.11, y: 386.66, scale: 0.97, duration: 2.32 },
    { x: 902.26, y: 390.38, scale: 1.7, duration: 5.45 },
    { x: 320.53, y: 215.92, scale: 1.39, duration: 5.87 },
    { x: 867.12, y: 299.22, scale: 1.26, duration: 2.54 },
    { x: 893.12, y: 35.1, scale: 1.63, duration: 4.23 },
    { x: 696.76, y: 153.47, scale: 1.21, duration: 3.23 },
    { x: 155.6, y: 27.86, scale: 1.92, duration: 1.47 },
    { x: 444.55, y: 14.5, scale: 1.74, duration: 1.35 },
    { x: 704.75, y: 9.13, scale: 1.57, duration: 4.28 },
    { x: 873.14, y: 271.52, scale: 1.96, duration: 1.7 },
    { x: 312.44, y: 11.01, scale: 1.69, duration: 3.91 },
    { x: 430.6, y: 244.84, scale: 1.4, duration: 1.11 },
    { x: 105.31, y: 43.23, scale: 1.89, duration: 4.93 },
    { x: 822.9, y: 268.63, scale: 0.94, duration: 3.13 },
    { x: 202.65, y: 488.85, scale: 0.96, duration: 4.07 },
    { x: 424.77, y: 286.41, scale: 0.56, duration: 2.23 },
    { x: 431.44, y: 495.88, scale: 1.57, duration: 1.73 },
    { x: 852.2, y: 240.64, scale: 1.41, duration: 4.68 },
    { x: 893.21, y: 49.48, scale: 1.72, duration: 5.99 },
    { x: 544.14, y: 11.06, scale: 1.27, duration: 2.62 },
    { x: 28.56, y: 142.57, scale: 1.0, duration: 2.5 },
    { x: 680.84, y: 37.53, scale: 0.83, duration: 1.44 },
    { x: 731.09, y: 405.02, scale: 1.8, duration: 4.18 },
    { x: 568.26, y: 364.49, scale: 1.98, duration: 4.92 },
    { x: 409.47, y: 31.03, scale: 1.64, duration: 3.22 },
    { x: 193.25, y: 488.72, scale: 1.58, duration: 2.26 },
    { x: 561.62, y: 327.23, scale: 1.93, duration: 5.3 },
    { x: 751.09, y: 135.08, scale: 1.87, duration: 4.24 },
    { x: 1006.54, y: 366.16, scale: 0.59, duration: 4.96 },
    { x: 16.49, y: 133.71, scale: 1.15, duration: 2.97 },
    { x: 801.76, y: 66.78, scale: 0.96, duration: 1.05 },
    { x: 9.91, y: 232.69, scale: 1.87, duration: 5.95 },
    { x: 673.05, y: 128.66, scale: 1.11, duration: 1.94 },
  ];
</script>

<svg
  class="-z-1 pointer-events-none absolute inset-0 mx-auto min-h-full w-full max-w-5xl px-4 py-3"
>
  <defs>
    <path
      id="star"
      d="M-1.74846e-07 4C-1.74846e-07 4 2.28237 3.98544 3.13391 3.13391C3.98544 2.28237 4 -1.06686e-07 4 -1.06686e-07C4 -1.06686e-07 4.0217 2.27524 4.87323 3.12677C5.72476 3.9783 8 4 8 4C8 4 5.74043 4.03736 4.88889 4.88889C4.03736 5.74043 4 8 4 8C4 8 4.00111 5.70195 3.14958 4.85042C2.29805 3.99889 -1.74846e-07 4 -1.74846e-07 4Z"
      fill="white"
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
