<script lang="ts">
  import '../app.css';

  import { Masthead } from '$lib/components/Masthead/index.js';
  import { mastheadState } from '$lib/states/index.js';

  const { children } = $props();

  let mastheadElement = $state<HTMLElement | null>(null);

  // Set up masthead element tracking
  $effect(() => {
    if (mastheadElement) {
      return mastheadState.setElement(mastheadElement);
    }
  });
</script>

<!-- Fixed masthead at the very top -->
<div bind:this={mastheadElement} class="fixed inset-x-0 top-0 z-100">
  <Masthead />
</div>

{@render children()}
