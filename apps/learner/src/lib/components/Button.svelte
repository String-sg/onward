<script lang="ts">
  import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

  type ButtonProps = Omit<HTMLButtonAttributes, 'disabled' | 'aria-disabled'> &
    Omit<HTMLAnchorAttributes, 'aria-disabled'> & {
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
       * Whether the button is disabled.
       *
       * @default false
       */
      disabled?: boolean;
    };

  const {
    variant = 'primary',
    size = 'lg',
    disabled = false,
    children,
    class: clazz,
    ...otherProps
  }: ButtonProps = $props();
</script>

{#if 'href' in otherProps}
  <a
    {...otherProps}
    aria-disabled={disabled}
    class={[
      'flex w-full cursor-pointer items-center justify-center gap-x-1 rounded-full border px-4 transition-colors aria-disabled:pointer-events-none aria-disabled:border-transparent aria-disabled:bg-slate-900/50 aria-disabled:text-white',
      variant === 'primary' && 'border-transparent bg-slate-950 text-white hover:bg-slate-900/90',
      variant === 'secondary' && 'border-slate-300 bg-white text-slate-950 hover:bg-slate-100',
      size === 'md' && 'py-2.75',
      size === 'lg' && 'py-3',
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
      'flex w-full cursor-pointer items-center justify-center gap-x-1 rounded-full border px-4 transition-colors aria-disabled:pointer-events-none aria-disabled:border-transparent aria-disabled:bg-slate-900/50 aria-disabled:text-white',
      variant === 'primary' && 'border-transparent bg-slate-950 text-white hover:bg-slate-900/90',
      variant === 'secondary' && 'border-slate-300 bg-white text-slate-950 hover:bg-slate-100',
      size === 'md' && 'py-2.75',
      size === 'lg' && 'py-3',
      clazz,
    ]}
  >
    {@render children?.()}
  </button>
{/if}
