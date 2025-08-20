<script lang="ts">
  import type { HTMLAttributes, PointerEventHandler } from 'svelte/elements';
  import { fade, fly } from 'svelte/transition';

  import { Portal } from '$lib/components/Portal/index.js';

  export interface Props extends HTMLAttributes<HTMLDivElement> {
    /**
     * Indicates whether the modal is open.
     */
    isopen: boolean;
    /**
     * A callback invoked when the modal is closed.
     */
    onclose: () => void;
    /**
     * The variant of the modal.
     *
     * @default 'light'
     */
    variant?: 'light' | 'dark';
    /**
     * The size of the modal.
     *
     * @default 'full'
     */
    size?: 'full' | 'partial';
    /**
     * Indicates whether the modal should be closed when the escape key is pressed.
     *
     * @default true
     */
    closeonescape?: boolean;
    /**
     * Indicates whether the modal should be closed when the backdrop is clicked.
     *
     * @default true
     */
    closeonbackdropclick?: boolean;
  }

  const {
    isopen,
    onclose,
    variant = 'light',
    size = 'full',
    closeonescape = true,
    closeonbackdropclick = true,
    class: clazz,
    children,
    ...otherProps
  }: Props = $props();

  $effect.pre(() => {
    const prev = document.body.style.getPropertyValue('overflow');

    if (isopen) {
      document.body.style.setProperty('overflow', 'hidden');
    }

    return () => {
      document.body.style.setProperty('overflow', prev);
    };
  });

  $effect(() => {
    if (!closeonescape || !isopen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      onclose();
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  });

  const handleBackdropClick: PointerEventHandler<HTMLDivElement> = () => {
    if (!closeonbackdropclick) {
      return;
    }

    onclose();
  };
</script>

<Portal>
  {#if isopen}
    <!-- Backdrop -->
    <div
      transition:fade={{ duration: 300 }}
      onpointerdown={handleBackdropClick}
      class="z-200 fixed inset-0 bg-slate-950/50"
    ></div>

    <div
      transition:fly={{ duration: 300, y: '100%', opacity: 1 }}
      class={[
        'z-201 fixed overflow-y-auto',
        variant === 'light' && 'bg-white',
        variant === 'dark' && 'bg-slate-950 text-white',
        size === 'full' && 'inset-0',
        size === 'partial' && 'inset-x-0 top-1/4',
        clazz,
      ]}
      {...otherProps}
    >
      {@render children?.()}
    </div>
  {/if}
</Portal>
