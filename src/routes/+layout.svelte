<script lang="ts">
  import '../app.css';

  const { children } = $props();

  import { initAnalytics } from '$lib/helpers/index.js';

  initAnalytics();
</script>

{@render children()}
