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
    'relative overflow-hidden rounded-4xl transition-shadow hover:ring-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed',
    type === 'BOB' && 'bg-blue-300 hover:ring-blue-300',
    type === 'AI' && 'bg-cyan-300 hover:ring-cyan-300',
    type === 'NEWS' && 'bg-orange-300 hover:ring-orange-300',
    type === 'PROD' && 'bg-emerald-300 hover:ring-emerald-300',
    type === 'CAREER' && 'bg-violet-300 hover:ring-violet-300',
    type === 'INNOV' && 'bg-pink-300 hover:ring-pink-300',
    type === 'WELLBEING' && 'bg-teal-300 hover:ring-teal-300',
    type === 'STU_WELL' && 'bg-sky-300 hover:ring-sky-300',
    type === 'STU_DEV' && 'bg-green-300 hover:ring-green-300',
  ]}
>
  <div
    class={[
      'absolute left-1/2 h-1/2 w-[110%] -translate-x-1/2 rounded-b-[50%]',
      type === 'BOB' && 'bg-blue-400',
      type === 'AI' && 'bg-cyan-400',
      type === 'NEWS' && 'bg-orange-400',
      type === 'PROD' && 'bg-emerald-400',
      type === 'CAREER' && 'bg-violet-400',
      type === 'INNOV' && 'bg-pink-400',
      type === 'WELLBEING' && 'bg-teal-400',
      type === 'STU_WELL' && 'bg-sky-400',
      type === 'STU_DEV' && 'bg-green-400',
    ]}
  ></div>

  <div class="relative z-1 flex flex-col gap-y-8 p-6">
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
