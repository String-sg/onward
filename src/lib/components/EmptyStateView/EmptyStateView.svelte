<script lang="ts">
  import { LinkButton } from '$lib/components/Button/index.js';

  export interface Props {
    /**
     * The name of the current user to display.
     */
    username: string;
    /**
     * The alt text for the image.
     */
    imagealt: string;
  }

  const { username, imagealt }: Props = $props();
</script>

<div class="flex flex-col items-center gap-y-6">
  <enhanced:img src="$lib/assets/bags-of-bites.png?w=708" alt={imagealt} class="w-[354px]" />
  <div class="flex flex-col items-center gap-y-4 text-center">
    <span class="text-xl font-medium">Welcome {username}</span>
    <span>
      Kick off your learning journey by diving
      <span class="block">into our exciting curated content!</span>
    </span>
  </div>
</div>

<div class="flex w-full justify-center px-4">
  <LinkButton href="/bites" width="full" class="max-w-sm">Start learning</LinkButton>
</div>
