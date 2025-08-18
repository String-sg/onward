<script lang="ts">
  import type { MouseEventHandler } from 'svelte/elements';

  export interface Props {
    /**
     * A callback invoked when the widget is clicked.
     */
    onclick: () => void;
  }

  let { onclick }: Props = $props();

  const handleClick: MouseEventHandler<HTMLButtonElement> = () => {
    onclick();
  };
</script>

<button
  onclick={handleClick}
  class="inset-shadow-sm inset-shadow-slate-200 p-5.5 pointer-events-auto flex cursor-pointer items-center justify-center rounded-full bg-white/30 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
  aria-label="Open chat"
>
  <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M16.0034 6.68726L17.7358 14.2625L25.3345 16.0007H25.3267L17.7358 17.7371L16.0034 25.3123V25.3337L16.0005 25.323L15.9985 25.3337V25.3123L14.2661 17.738L6.67236 16.0007H6.66846L14.2661 14.2625L15.9985 6.68726V6.66675L16.0005 6.67651L16.0034 6.66675V6.68726Z"
      fill="currentColor"
    />
    <ellipse cx="15.9994" cy="2.8485" rx="0.848546" ry="0.848502" fill="currentColor" />
    <ellipse cx="15.9994" cy="29.152" rx="0.848546" ry="0.848502" fill="currentColor" />
    <ellipse
      cx="29.1515"
      cy="16.0001"
      rx="0.848502"
      ry="0.848546"
      transform="rotate(90 29.1515 16.0001)"
      fill="currentColor"
    />
    <ellipse
      cx="2.84872"
      cy="16.0001"
      rx="0.848502"
      ry="0.848546"
      transform="rotate(90 2.84872 16.0001)"
      fill="currentColor"
    />
    <circle
      cx="0.848524"
      cy="0.848524"
      r="0.848524"
      transform="matrix(-0.707112 0.707102 -0.707112 -0.707102 26.5024 25.2993)"
      fill="currentColor"
    />
    <circle
      cx="0.848524"
      cy="0.848524"
      r="0.848524"
      transform="matrix(-0.707112 0.707102 -0.707112 -0.707102 7.90137 6.7002)"
      fill="currentColor"
    />
    <circle
      cx="0.848524"
      cy="0.848524"
      r="0.848524"
      transform="matrix(-0.707112 -0.707102 0.707111 -0.707102 6.70068 26.5)"
      fill="currentColor"
    />
    <circle
      cx="0.848524"
      cy="0.848524"
      r="0.848524"
      transform="matrix(-0.707112 -0.707102 0.707111 -0.707102 25.2988 7.90088)"
      fill="currentColor"
    />
  </svg>
</button>
