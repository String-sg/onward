<script lang="ts" module>
  import type { HTMLAnchorAttributes } from 'svelte/elements';
  import { tv,type VariantProps } from 'tailwind-variants';

  import type { WithElementRef } from '$lib/utils.js';

  export const badgeVariants = tv({
    base: 'focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] [&>svg]:pointer-events-none [&>svg]:size-3',
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground [a&]:hover:bg-primary/90 border-transparent',
        secondary:
          'bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90 border-transparent',
        destructive:
          'bg-destructive [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 border-transparent text-white',
        outline: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        blue: 'border-blue-400 bg-blue-200 text-blue-900 hover:bg-blue-200/80',
        cyan: 'border-cyan-400 bg-cyan-200 text-cyan-900 hover:bg-cyan-200/80',
        orange: 'border-orange-400 bg-orange-200 text-orange-900 hover:bg-orange-200/80',
        emerald: 'border-emerald-400 bg-emerald-200 text-emerald-900 hover:bg-emerald-200/80',
        violet: 'border-violet-400 bg-violet-200 text-violet-900 hover:bg-violet-200/80',
        pink: 'border-pink-400 bg-pink-200 text-pink-900 hover:bg-pink-200/80',
        teal: 'border-teal-400 bg-teal-200 text-teal-900 hover:bg-teal-200/80',
        sky: 'border-sky-400 bg-sky-200 text-sky-900 hover:bg-sky-200/80',
        green: 'border-green-400 bg-green-200 text-green-900 hover:bg-green-200/80',
        lime: 'border-lime-400 bg-lime-200 text-lime-900 hover:bg-lime-200/80',
        slate: 'border-transparent bg-slate-200 text-slate-950 hover:bg-slate-200/80',
        'slate-light': 'border-slate-300 bg-slate-100 text-slate-900 hover:bg-slate-100/80',
        'slate-dark': 'border-transparent bg-slate-950 text-slate-100 hover:bg-slate-950/80',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  });

  export type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

  export type BadgeProps = WithElementRef<HTMLAnchorAttributes> & {
    variant?: BadgeVariant;
  };
</script>

<script lang="ts">
  import { cn } from '$lib/utils.js';

  let {
    ref = $bindable(null),
    href,
    class: className,
    variant = 'default',
    children,
    ...restProps
  }: BadgeProps = $props();
</script>

<svelte:element
  this={href ? 'a' : 'span'}
  bind:this={ref}
  data-slot="badge"
  {href}
  class={cn(badgeVariants({ variant }), className)}
  {...restProps}
>
  {@render children?.()}
</svelte:element>
