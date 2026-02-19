<script lang="ts">
  import '../../app.css';

  import faviconPNG from '$lib/assets/favicon.png';
  import faviconSVG from '$lib/assets/favicon.svg';
  import faviconLightPNG from '$lib/assets/favicon-light.png';
  import faviconLightSVG from '$lib/assets/favicon-light.svg';
  import { Footer } from '$lib/components/Footer/index.js';
  import { Masthead } from '$lib/components/Masthead/index.js';
  import { initAnalytics } from '$lib/helpers/index.js';

  const { children } = $props();

  initAnalytics();

  let mastheadHeight = $state(28);
</script>

<svelte:head>
  <link
    rel="icon"
    type="image/svg+xml"
    href={faviconLightSVG}
    media="(prefers-color-scheme: dark)"
  />
  <link rel="icon" type="image/svg+xml" href={faviconSVG} media="(prefers-color-scheme: light)" />
  <link rel="icon" type="image/png" href={faviconLightPNG} media="(prefers-color-scheme: dark)" />
  <link rel="icon" type="image/png" href={faviconPNG} media="(prefers-color-scheme: light)" />
</svelte:head>

<div class="fixed inset-x-0 top-0 z-100" bind:clientHeight={mastheadHeight}>
  <Masthead />
</div>

<div style="margin-top: {mastheadHeight}px">
  {@render children()}
</div>

<Footer />
