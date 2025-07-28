<script lang="ts">
  import '../app.css';

  import { AudioState } from '$lib/helpers/index.js';

  const { children } = $props();

  AudioState.create();
</script>

{@render children()}
