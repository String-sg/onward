<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  export interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
    /**
     * The variant of the badge.
     */
    variant:
      | 'blue'
      | 'cyan'
      | 'orange'
      | 'emerald'
      | 'violet'
      | 'pink'
      | 'teal'
      | 'sky'
      | 'green'
      | 'lime'
      | 'slate'
      | 'slate-dark';
    /**
     * The content of the badge.
     */
    children: Snippet;
  }

  let { variant, children, class: clazz, ...otherProps }: Props = $props();
</script>

<div
  class={[
    'inline-flex w-fit rounded-md border px-2.5 py-0.75',
    variant === 'blue' && 'border-blue-400 bg-blue-200 text-blue-900',
    variant === 'cyan' && 'border-cyan-400 bg-cyan-200 text-cyan-900',
    variant === 'orange' && 'border-orange-400 bg-orange-200 text-orange-900',
    variant === 'emerald' && 'border-emerald-400 bg-emerald-200 text-emerald-900',
    variant === 'violet' && 'border-violet-400 bg-violet-200 text-violet-900',
    variant === 'pink' && 'border-pink-400 bg-pink-200 text-pink-900',
    variant === 'teal' && 'border-teal-400 bg-teal-200 text-teal-900',
    variant === 'sky' && 'border-sky-400 bg-sky-200 text-sky-900',
    variant === 'green' && 'border-green-400 bg-green-200 text-green-900',
    variant === 'lime' && 'border-lime-400 bg-lime-200 text-lime-900',
    variant === 'slate' && 'border-transparent bg-slate-200 text-slate-950',
    variant === 'slate-dark' && 'border-transparent bg-slate-950 text-slate-100',
    clazz,
  ]}
  {...otherProps}
>
  <span class="text-xs font-semibold whitespace-nowrap">
    {@render children()}
  </span>
</div>
