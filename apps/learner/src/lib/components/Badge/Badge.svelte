<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  export interface Props extends HTMLAttributes<HTMLDivElement> {
    variant: 'blue' | 'orange' | 'amber' | 'teal' | 'rose' | 'purple' | 'slate';
    children: Snippet;
  }

  let { variant, children, class: clazz, ...otherProps }: Props = $props();
</script>

<div
  {...otherProps}
  class={[
    'inline-flex w-fit rounded-md px-2.5 py-1',
    variant === 'blue' && 'bg-blue-200 text-blue-900',
    variant === 'orange' && 'bg-orange-200 text-orange-900',
    variant === 'amber' && 'bg-amber-200 text-amber-900',
    variant === 'teal' && 'bg-teal-200 text-teal-900',
    variant === 'rose' && 'bg-rose-200 text-rose-900',
    variant === 'purple' && 'bg-purple-200 text-purple-900',
    variant === 'slate' && 'bg-slate-200 text-slate-950',
    clazz,
  ]}
>
  <span class="whitespace-nowrap text-xs font-semibold">
    {@render children()}
  </span>
</div>
