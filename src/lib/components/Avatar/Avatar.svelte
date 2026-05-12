<script lang="ts">
  export interface Props {
    src: string | null;
    name: string;
  }

  const { src, name }: Props = $props();
  const initial = $derived(name.trim().charAt(0).toUpperCase());
</script>

{#if src}
  <img {src} alt="profile" class="h-full w-full object-cover" />
{:else}
  <span
    aria-label="profile"
    class="flex h-full w-full items-center justify-center bg-slate-700 text-sm font-semibold text-white"
  >
    {initial}
  </span>
{/if}
