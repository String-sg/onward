<script lang="ts">
  import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

  export type Props = (
    | Omit<HTMLButtonAttributes, 'disabled' | 'aria-disabled'>
    | ({ href: string } & Omit<HTMLAnchorAttributes, 'href' | 'aria-disabled'>)
  ) & {
    /**
     * The variant of the button.
     *
     * @default 'primary'
     */
    variant?: 'primary' | 'secondary';
    /**
     * The size of the button.
     *
     * @default 'lg'
     */
    size?: 'md' | 'lg';
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
  };

  const {
    variant = 'primary',
    size = 'lg',
    width = 'fit',
    disabled = false,
    children,
    class: clazz,
    ...otherProps
  }: Props = $props();
</script>

{#if 'href' in otherProps}
  <a
    {...otherProps}
    aria-disabled={disabled}
    class={[
      'flex cursor-pointer items-center justify-center gap-x-1 rounded-full border px-4 transition-colors aria-disabled:pointer-events-none aria-disabled:border-transparent aria-disabled:bg-slate-900/50 aria-disabled:text-white',
      variant === 'primary' && 'border-transparent bg-slate-950 text-white hover:bg-slate-900/90',
      variant === 'secondary' && 'border-slate-300 bg-white text-slate-950 hover:bg-slate-100',
      size === 'md' && 'py-2.75',
      size === 'lg' && 'py-3',
      width === 'fit' && 'w-fit',
      width === 'full' && 'w-full',
      clazz,
    ]}
  >
    {@render children?.()}
  </a>
{:else}
  <button
    {...otherProps}
    aria-disabled={disabled}
    {disabled}
    class={[
      'flex cursor-pointer items-center justify-center gap-x-1 rounded-full border px-4 transition-colors aria-disabled:pointer-events-none aria-disabled:border-transparent aria-disabled:bg-slate-900/50 aria-disabled:text-white',
      variant === 'primary' && 'border-transparent bg-slate-950 text-white hover:bg-slate-900/90',
      variant === 'secondary' && 'border-slate-300 bg-white text-slate-950 hover:bg-slate-100',
      size === 'md' && 'py-2.75',
      size === 'lg' && 'py-3',
      width === 'fit' && 'w-fit',
      width === 'full' && 'w-full',
      clazz,
    ]}
  >
    {@render children?.()}
  </button>
{/if}
