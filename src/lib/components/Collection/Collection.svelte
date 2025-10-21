<script lang="ts">
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
     * Total number of podcasts in this collection.
     */
    numberofpodcasts: number;
    /**
     * Defines the visual theme and icon for the collection.
     */
    type:
      | 'AI'
      | 'BOB'
      | 'CAREER'
      | 'INNOV'
      | 'NEWS'
      | 'PROD'
      | 'STU_DEV'
      | 'STU_WELL'
      | 'WELLBEING';
  }

  let { to, title, numberofpodcasts, type }: Props = $props();
</script>

<a
  href={to}
  class={[
    'relative flex flex-col gap-y-2 overflow-hidden rounded-4xl p-6 transition-shadow hover:ring-1 hover:ring-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed',
    type === 'BOB' && 'bg-blue-300',
    type === 'AI' && 'bg-cyan-300',
    type === 'NEWS' && 'bg-orange-300',
    type === 'PROD' && 'bg-emerald-300',
    type === 'CAREER' && 'bg-violet-300',
    type === 'INNOV' && 'bg-pink-300',
    type === 'WELLBEING' && 'bg-teal-300',
    type === 'STU_WELL' && 'bg-sky-300',
    type === 'STU_DEV' && 'bg-green-300',
  ]}
>
  <div class="flex flex-col gap-y-8">
    <div class="flex justify-center">
      {#if type === 'BOB'}
        <enhanced:img
          src="$lib/assets/collections/learn-with-bob.png?w=464"
          alt={title}
          class="w-[232px]"
        />
      {:else if type === 'AI'}
        <enhanced:img
          src="$lib/assets/collections/artificial-intelligence.png?w=464"
          alt={title}
          class="w-[232px]"
        />
      {:else if type === 'NEWS'}
        <enhanced:img
          src="$lib/assets/collections/in-the-news.png?w=464"
          alt={title}
          class="w-[232px]"
        />
      {:else if type === 'PROD'}
        <enhanced:img
          src="$lib/assets/collections/productivity.png?w=464"
          alt={title}
          class="w-[232px]"
        />
      {:else if type === 'CAREER'}
        <enhanced:img
          src="$lib/assets/collections/career-growth.png?w=464"
          alt={title}
          class="w-[232px]"
        />
      {:else if type === 'INNOV'}
        <enhanced:img
          src="$lib/assets/collections/innovation.png?w=464"
          alt={title}
          class="w-[232px]"
        />
      {:else if type === 'WELLBEING'}
        <enhanced:img
          src="$lib/assets/collections/wellbeing.png?w=464"
          alt={title}
          class="w-[232px]"
        />
      {:else if type === 'STU_WELL'}
        <enhanced:img
          src="$lib/assets/collections/student-wellbeing.png?w=464"
          alt={title}
          class="w-[232px]"
        />
      {:else if type === 'STU_DEV'}
        <enhanced:img
          src="$lib/assets/collections/student-development.png?w=464"
          alt={title}
          class="w-[232px]"
        />
      {/if}
    </div>

    <div class="flex flex-col gap-y-2">
      <span class="text-xl font-semibold">
        {title}
      </span>

      <div class="flex flex-col">
        <span class="text-sm">
          {numberofpodcasts} podcast(s)
        </span>
      </div>
    </div>
  </div>
</a>
