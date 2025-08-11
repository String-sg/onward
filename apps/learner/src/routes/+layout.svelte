<script lang="ts">
  import '../app.css';

  import { Player } from '$lib/states';

  const { children } = $props();

  Player.create();
</script>

{@render children()}
