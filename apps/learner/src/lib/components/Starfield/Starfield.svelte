<script lang="ts">
  export interface Props {
    starCount?: number;
    width?: number;
    height?: number;
    minScale?: number;
    maxScale?: number;
  }

  const {
    starCount = 40,
    width = 1024,
    height = 512,
    minScale = 0.5,
    maxScale = 2,
  }: Props = $props();

  const stars = Array.from({ length: starCount }, () => {
    const scale = minScale + Math.random() * (maxScale - minScale);
    const x = Math.random() * (width - 8 * scale);
    const y = Math.random() * (height - 8 * scale);
    const delay = 1 + Math.random() * 5;
    return { x, y, scale, delay };
  });
</script>

<div class="-z-1 fixed mx-auto min-h-full w-full max-w-5xl">
  <svg class="absolute inset-0 h-full w-full">
    <defs>
      <path
        id="star"
        d="M-1.74846e-07 4C-1.74846e-07 4 2.28237 3.98544 3.13391 3.13391C3.98544 2.28237 4 -1.06686e-07 4 -1.06686e-07C4 -1.06686e-07 4.0217 2.27524 4.87323 3.12677C5.72476 3.9783 8 4 8 4C8 4 5.74043 4.03736 4.88889 4.88889C4.03736 5.74043 4 8 4 8C4 8 4.00111 5.70195 3.14958 4.85042C2.29805 3.99889 -1.74846e-07 4 -1.74846e-07 4Z"
        fill="white"
      />
    </defs>
    <!-- Generate many stars -->
    <g id="stars">
      {#each stars as star, i (i)}
        <use href="#star" transform={`translate(${star.x},${star.y}) scale(${star.scale})`}>
          <animate
            attributeName="opacity"
            values="0;1;0"
            dur={`${star.delay}s`}
            repeatCount="indefinite"
          />
        </use>
      {/each}
    </g>
  </svg>
</div>
