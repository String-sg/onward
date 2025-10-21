<script lang="ts">
  import '../app.css';

  import faviconPNG from '$lib/assets/favicon.png';
  import faviconSVG from '$lib/assets/favicon.svg';
  import faviconLightPNG from '$lib/assets/favicon-light.png';
  import faviconLightSVG from '$lib/assets/favicon-light.svg';

  const { children } = $props();

  import { initAnalytics } from '$lib/helpers/index.js';

  initAnalytics();
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

{@render children()}
