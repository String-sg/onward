<script lang="ts">
  import { HandHeart, MessageCircleQuestion, PersonStanding } from '@lucide/svelte';

  import Collection from '$lib/components/Collection.svelte';
</script>

<div class="grid auto-rows-fr grid-cols-2 gap-4 px-6 pt-5 [&>:first-child]:col-span-2">
  <!-- Collection 1 -->
  <Collection
    title="Special Educational Needs"
    icon={HandHeart}
    numberofpodcasts={12}
    numberofnotes={2}
    variant="purple"
  />

  <!-- Collection 2 -->
  <Collection
    title="Character and Citizenship Education"
    icon={PersonStanding}
    numberofpodcasts={8}
    numberofnotes={3}
    variant="rose"
  />

  <!-- Collection 3 -->
  <Collection
    title="Inclusive Education"
    icon={MessageCircleQuestion}
    numberofpodcasts={10}
    numberofnotes={1}
    variant="amber"
  />
</div>
