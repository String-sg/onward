<script lang="ts">
  import type { HTMLAnchorAttributes } from 'svelte/elements';

  export interface Props extends Omit<HTMLAnchorAttributes, 'aria-disabled'> {
    /**
     * The variant of the button.
     *
     * @default 'primary'
     */
    variant?: 'primary' | 'secondary';
    /**
     * The width of the button.
     *
     * @default 'fit'
     */
    width?: 'fit' | 'full';
    /**
     * Indicates whether the button is disabled.
     *
     * @default false
     */
    disabled?: boolean;
  }

  const {
    variant = 'primary',
    width = 'fit',
    disabled = false,
    href,
    children,
    class: clazz,
    ...otherProps
  }: Props = $props();
</script>

<a
  href={disabled ? null : href}
  class={[
    'px-3.75 py-2.75 inline-flex cursor-pointer items-center justify-center gap-x-1 rounded-full border transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950',
    'aria-disabled:pointer-events-none aria-disabled:border-transparent aria-disabled:bg-slate-900/50 aria-disabled:text-white',
    variant === 'primary' && 'border-transparent bg-slate-950 text-white hover:bg-slate-900/90',
    variant === 'secondary' && 'border-slate-300 bg-white text-slate-950 hover:bg-slate-100',
    width === 'fit' && 'w-fit',
    width === 'full' && 'w-full',
    clazz,
  ]}
  aria-disabled={disabled}
  {...otherProps}
>
  {@render children?.()}
</a>
