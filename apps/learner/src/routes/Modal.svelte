<script lang="ts">
  import { EllipsisVertical, Plus, X } from '@lucide/svelte';

  interface Props {
    onClose: () => void;
  }

  let { onClose }: Props = $props();
</script>

<div
  class="z-100 fixed bottom-0 left-0 right-0 top-10 flex flex-col rounded-3xl bg-purple-50 bg-opacity-50 px-6"
>
  <div class="mt-2 flex items-center justify-center">
    <div class="flex h-1.5 w-28 items-center justify-center rounded-3xl bg-purple-100"></div>
  </div>

  <div class="mb-8 mt-4 flex items-center justify-between">
    <div
      class="relative h-16 w-16 overflow-hidden rounded-3xl bg-gradient-to-bl from-purple-600 to-pink-500"
    >
      <div
        class="absolute left-[9px] top-[19.20px] text-center text-xs font-bold leading-3 text-white"
      >
        Weekly <br />SEN
      </div>
      <div
        class="absolute left-[26px] top-[47px] text-center text-[6px] font-bold leading-3 text-white"
      >
        SEN
      </div>
    </div>
    <div class="flex gap-4">
      <button class="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
        <EllipsisVertical />
      </button>
      <button
        class="flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 hover:bg-purple-300"
      >
        <Plus class="h-4 w-4" />
        <span class="text-sm font-medium text-black">My learning</span>
      </button>
      <button
        class="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100"
        onclick={() => onClose()}
      >
        <X class="h-4 w-4 text-black" />
      </button>
    </div>
  </div>

  <div class="mb-2 inline-flex h-5 flex-col items-start justify-center">
    <div class="rounded-md bg-purple-500 px-2.5 py-0.5">
      <span class="text-xs font-medium leading-none text-lime-50"> Special Educational Needs </span>
    </div>
  </div>

  <div class="mb-5 flex flex-col gap-2">
    <span class="text-xl font-medium text-slate-950"
      >Navigating Special Educational Needs in Singapore: A Path to Inclusion</span
    >
    <span class="text-sm text-slate-600">Guidance Branch • 2 days ago</span>
  </div>

  <div class="mb-5">
    <p></p>
    <p>
      This podcast explores how teachers in Singapore can effectively support students with Special
      Educational Needs (SEN) in mainstream classrooms, fostering inclusion through practical
      strategies and collaboration. Learn key approaches to address diverse learning needs, align
      with MOE&rsquo;s inclusive education goals, and create equitable learning environments.
    </p>
  </div>
  <span class="font-bold">What You Will Learn</span>
  <ol class="list-disc pl-4">
    <li>
      Understand Singapore&rsquo;s SEN framework and the role of Allied Educators in mainstream
      schools.
    </li>
    <li>
      Apply practical strategies, like differentiated instruction, to support students with
      disabilities (e.g., autism, dyslexia).
    </li>
    <li>Use assistive technologies to enhance accessibility for SEN students.</li>
    <li>
      Collaborate effectively with parents and SEN officers to develop Individual Education Plans
      (IEPs).
    </li>
    <li>
      Create inclusive classroom environments that promote engagement and equity for all learners.
    </li>
  </ol>

  <div class="z-1000 flex flex-col gap-4 px-1">
    <div class="flex items-center justify-between">
      <div class="flex flex-col">
        <span class="font-medium text-slate-950">Section 01:</span>
        <span class="font-medium text-slate-950">Context sharing by SEN branch</span>
      </div>
      <div
        class="inline-flex h-10 flex-col items-center justify-center overflow-hidden rounded-bl-[20px] rounded-br rounded-tl-[20px] rounded-tr bg-purple-100"
      >
        <span class="text-sm font-medium text-slate-950">1.0x</span>
      </div>
    </div>
  </div>
</div>
