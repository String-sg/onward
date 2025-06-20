<script lang="ts">
  import { HandHeart, MessageCircleQuestion, PersonStanding } from '@lucide/svelte';

  import Collection from '$lib/components/Collection.svelte';
</script>

<div class="grid auto-rows-fr grid-cols-2 gap-4 px-6 pt-5">
  <!-- Collection 1 -->
  <div class="col-span-2">
    <Collection
      title="Special Educational Needs"
      icon={HandHeart}
      noOfPodcasts={12}
      noOfNotes={2}
      variant="purple"
    />
  </div>

  <!-- Collection 2 -->
  <div>
    <Collection
      title="Character and Citizenship Education"
      icon={PersonStanding}
      noOfPodcasts={8}
      noOfNotes={3}
      variant="rose"
    />
  </div>

  <!-- Collection 3 -->
  <div>
    <Collection
      title="Inclusive Education"
      icon={MessageCircleQuestion}
      noOfPodcasts={10}
      noOfNotes={1}
      variant="amber"
    />
  </div>
</div>
