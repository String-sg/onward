<script lang="ts">
  import { mount, type Snippet, unmount } from 'svelte';

  import PortalConsumer from './PortalConsumer.svelte';

  export interface Props {
    /**
     * The content to render within the portal.
     */
    children?: Snippet;
    /**
     * Indicates whether to disable portalling and render the content inline.
     *
     * @default false
     */
    disabled?: boolean;
  }

  const { children, disabled = false }: Props = $props();

  let instance: ReturnType<typeof mount> | null;

  $effect(() => {
    if (disabled) {
      unmountInstance();
      return;
    }

    instance = mount(PortalConsumer, {
      target: document.body,
      props: {
        children,
      },
    });

    return () => {
      unmountInstance();
    };
  });

  const unmountInstance = () => {
    if (instance) {
      unmount(instance);
      instance = null;
    }
  };
</script>

{#if disabled}
  {@render children?.()}
{/if}
