<script lang="ts">
  export type Variant = 'purple' | 'teal' | 'amber';

  import Badge from '$lib/components/Badge.svelte';

  interface Props {
    /**
     * The URL to navigate to when the user clicks on the MLU.
     */
    to: string;
    /**
     * The tag to display on the Collection.
     */
    tag: string;
    /**
     * The title of the Collection.
     */
    title: string;
    /**
     * Total number of podcasts in this Collection.
     */
    numberofpodcasts: number;
    /**
     * Total number of notes in this Collection.
     */
    numberofnotes: number;
    /**
     * Visual colour theme for the Collection.
     */
    variant: Variant;
  }

  let { to, tag, title, numberofpodcasts, numberofnotes, variant }: Props = $props();
</script>

<a
  href={to}
  class={[
    'flex flex-col gap-y-2 rounded-3xl bg-gradient-to-b p-6',
    variant === 'purple' && 'from-purple-800 via-purple-500 to-fuchsia-500',
    variant === 'amber' && 'from-amber-400 to-yellow-300',
    variant === 'teal' && 'from-teal-400 to-blue-500',
  ]}
>
  <div class="flex flex-col gap-y-6">
    <div class="flex h-[320px] flex-col">
      <div class="flex justify-end">
        <div class="p-3">
          {#if variant === 'purple'}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 32 32"
              fill="none"
            >
              <path
                d="M7.17383 0.117676C5.17173 2.97341 3.99609 6.45115 3.99609 10.2036C3.99614 19.9183 11.8715 27.7935 21.5859 27.7935C25.4837 27.7934 29.0844 26.5243 32 24.3784C28.8189 28.9154 23.5515 31.8822 17.5898 31.8823C7.87542 31.8823 0 24.0072 0 14.2925C5.67763e-05 8.47619 2.82343 3.3199 7.17383 0.117676Z"
                fill="white"
              />
            </svg>
          {:else if variant === 'amber'}
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M-8.74228e-07 20C-8.74228e-07 20 11.4119 19.9272 15.6695 15.6695C19.9272 11.4119 20 -8.74228e-07 20 -8.74228e-07C20 -8.74228e-07 20.1085 11.3762 24.3661 15.6339C28.6238 19.8915 40 20 40 20C40 20 28.7021 20.1868 24.4445 24.4445C20.1868 28.7021 20 40 20 40C20 40 20.0056 28.5098 15.7479 24.2521C11.4902 19.9944 -8.74228e-07 20 -8.74228e-07 20Z"
                fill="white"
              />
            </svg>
          {:else if variant === 'teal'}
            <svg
              width="40"
              height="40"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_1294_18803)">
                <path
                  d="M4.28516 24.2842C4.28516 24.2842 15.697 24.2114 19.9547 19.9537C24.2123 15.696 24.2852 4.28418 24.2852 4.28418C24.2852 4.28418 24.3936 15.6604 28.6513 19.918C32.909 24.1757 44.2852 24.2842 44.2852 24.2842C44.2852 24.2842 32.9873 24.471 28.7296 28.7287C24.472 32.9863 24.2852 44.2842 24.2852 44.2842C24.2852 44.2842 24.2907 32.7939 20.033 28.5363C15.7754 24.2786 4.28516 24.2842 4.28516 24.2842Z"
                  fill="white"
                />
                <path
                  d="M10.1421 10.142C10.1421 10.142 18.263 18.16 24.2843 18.16C30.3055 18.16 38.4264 10.142 38.4264 10.142C38.4264 10.142 30.4589 18.2629 30.4589 24.2842C30.4589 30.3054 38.4264 38.4263 38.4264 38.4263C38.4264 38.4263 30.3055 30.5696 24.2843 30.5696C18.263 30.5696 10.1421 38.4263 10.1421 38.4263C10.1421 38.4263 18.2709 30.3054 18.2709 24.2842C18.2709 18.2629 10.1421 10.142 10.1421 10.142Z"
                  fill="white"
                />
                <path
                  d="M14.2854 6.96387C14.2854 6.96387 20.0543 16.8104 25.8704 18.3688C31.6865 19.9273 41.6059 14.2844 41.6059 14.2844C41.6059 14.2844 31.808 20.0664 30.2496 25.8825C28.6912 31.6986 34.2853 41.6049 34.2853 41.6049C34.2853 41.6049 28.4746 31.9141 22.6586 30.3556C16.8425 28.7972 6.96484 34.2844 6.96484 34.2844C6.96484 34.2844 16.9185 28.5441 18.4769 22.728C20.0353 16.9119 14.2854 6.96387 14.2854 6.96387Z"
                  fill="white"
                />
                <path
                  d="M19.1076 4.96522C19.1076 4.96522 22.1315 15.9694 27.3461 18.98C32.5606 21.9906 43.6025 19.1074 43.6025 19.1074C43.6025 19.1074 32.642 22.1565 29.6314 27.3711C26.6207 32.5856 29.4603 43.6023 29.4603 43.6023C29.4603 43.6023 26.3558 32.7377 21.1412 29.7271C15.9267 26.7165 4.96544 29.4601 4.96544 29.4601C4.96544 29.4601 16.0656 26.4916 19.0762 21.277C22.0868 16.0625 19.1076 4.96522 19.1076 4.96522Z"
                  fill="white"
                />
                <path
                  d="M29.4591 4.96544C29.4591 4.96544 26.5759 16.0073 29.5865 21.2219C32.5971 26.4364 43.6013 29.4603 43.6013 29.4603C43.6013 29.4603 32.5846 26.6207 27.3701 29.6314C22.1555 32.642 19.1064 43.6025 19.1064 43.6025C19.1064 43.6025 21.85 32.6412 18.8394 27.4267C15.8288 22.2121 4.96424 19.1076 4.96424 19.1076C4.96424 19.1076 16.0615 22.0868 21.2761 19.0762C26.4906 16.0656 29.4591 4.96544 29.4591 4.96544Z"
                  fill="white"
                />
                <path
                  d="M34.2814 6.96387C34.2814 6.96387 28.6386 16.8832 30.197 22.6993C31.7554 28.5154 41.602 34.2844 41.602 34.2844C41.602 34.2844 31.6956 28.6902 25.8796 30.2486C20.0635 31.807 14.2814 41.6049 14.2814 41.6049C14.2814 41.6049 19.7686 31.7272 18.2102 25.9112C16.6518 20.0951 6.96094 14.2844 6.96094 14.2844C6.96094 14.2844 16.909 20.0343 22.7251 18.4759C28.5411 16.9175 34.2814 6.96387 34.2814 6.96387Z"
                  fill="white"
                />
              </g>
              <defs>
                <clipPath id="clip0_1294_18803">
                  <rect width="48" height="48" fill="white" />
                </clipPath>
              </defs>
            </svg>
          {/if}
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-y-2">
      <div class="flex flex-col gap-y-1">
        <Badge {variant}>{tag}</Badge>

        <span
          class={['text-xl font-semibold', variant === 'amber' ? 'text-slate-950' : 'text-white']}
        >
          {title}
        </span>
      </div>

      <div class="flex flex-col">
        <span class="text-sm text-white">{numberofpodcasts} podcasts</span>
        <span class="text-sm text-white">{numberofnotes} notes</span>
      </div>
    </div>
  </div>
</a>
