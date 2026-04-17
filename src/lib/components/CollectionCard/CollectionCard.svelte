<script lang="ts">
  import { Bot, Library } from '@lucide/svelte';

  export interface Props {
    /**
     * The URL to navigate to when clicking the collection.
     */
    to: string;
    /**
     * The title of the collection.
     */
    title: string;
    /**
     * Total number of bites in this collection.
     */
    numberofbites: number;
    /**
     * Optional due date string for the collection.
     */
    dueDate?: string;
  }

  let { to, title, numberofbites, dueDate }: Props = $props();
</script>

<a
  href={to}
  class={[
    'relative min-h-30 overflow-hidden rounded-4xl transition-shadow hover:ring-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed',
    title === 'AI Literacy' ? 'bg-pink-500 hover:ring-pink-300' : 'bg-blue-500 hover:ring-blue-300',
  ]}
>
  <div class="relative z-1 flex gap-x-6 gap-y-2 p-6 text-white">
    <div class="flex items-center">
      <div
        class={[
          'flex items-center justify-center rounded-2xl p-3',
          title === 'AI Literacy' ? 'bg-pink-300' : 'bg-blue-300',
        ]}
      >
        {#if title === 'AI Literacy'}
          <Bot class="h-8 w-8 text-pink-600" />
        {:else}
          <Library class="h-8 w-8 text-blue-600" />
        {/if}
      </div>
    </div>
    <div class="flex flex-col gap-y-2">
      <span class="text-xl font-semibold">
        {title}
      </span>

      <div class="flex flex-col gap-y-1 text-sm">
        <span>
          {numberofbites} bite{numberofbites === 1 ? '' : 's'}
        </span>
        {#if dueDate}
          <span>
            Due {new Date(dueDate).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        {/if}
      </div>
    </div>
  </div>
</a>
