<script lang="ts">
  import { CloudUpload, FileIcon, XIcon } from '@lucide/svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';

  export interface Props extends Omit<HTMLInputAttributes, 'type' | 'class'> {
    /**
     * Additional classes for the container
     */
    class?: string;
  }

  const { class: clazz, accept, ...otherProps }: Props = $props();

  let fileInput: HTMLInputElement;
  let isDragging = $state(false);
  let selectedFile = $state<File | null>(null);

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    isDragging = true;
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    isDragging = false;
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragging = false;

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (accept) {
        const acceptTypes = accept.split(',').map((t) => t.trim());
        const fileType = file.type;
        const fileExt = '.' + file.name.split('.').pop();

        const isAccepted = acceptTypes.some((type) => {
          if (type.endsWith('/*')) {
            return fileType.startsWith(type.replace('/*', ''));
          }
          return type === fileType || type === fileExt;
        });

        if (!isAccepted) {
          return;
        }
      }

      try {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
      } catch (err) {
        console.log(err);
      }

      selectedFile = file;

      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function handleFileSelect(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      selectedFile = target.files[0];
    } else {
      selectedFile = null;
    }
  }

  function openFileDialog() {
    fileInput.click();
  }

  function clearFile(e?: Event) {
    e?.stopPropagation();
    fileInput.value = '';
    selectedFile = null;
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
</script>

<div class={clazz}>
  <div
    role="button"
    tabindex="0"
    class={[
      'focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed',
      'relative cursor-pointer rounded-lg border-2 border-dashed transition-all',
      isDragging
        ? 'border-slate-500 bg-slate-100'
        : selectedFile
          ? 'border-slate-600 bg-slate-100'
          : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100',
      'p-6',
    ].join(' ')}
    ondragover={handleDragOver}
    ondragleave={handleDragLeave}
    ondrop={handleDrop}
    onclick={openFileDialog}
    onkeydown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openFileDialog();
      }
    }}
  >
    <input
      bind:this={fileInput}
      type="file"
      class="hidden"
      {accept}
      onchange={handleFileSelect}
      {...otherProps}
    />

    {#if selectedFile}
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <FileIcon class="size-10 text-slate-600" />

          <div>
            <p class="font-medium">{selectedFile.name}</p>
            <p class="text-sm text-slate-500">{formatFileSize(selectedFile.size)}</p>
          </div>
        </div>

        <button
          type="button"
          class="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
          aria-label="Clear selected file"
          onclick={clearFile}
        >
          <XIcon class="h-5 w-5" />
        </button>
      </div>
    {:else}
      <div class="text-center">
        <CloudUpload class="mx-auto size-12 text-slate-400" />

        <div class="mt-4">
          <p class="text-sm font-medium text-slate-900">
            {isDragging ? 'Drop file here' : 'Drag and drop file here, or click to browse'}
          </p>
          <p class="mt-1 text-xs text-slate-500">
            {accept ? `Accepts: ${accept}` : 'Any file type'}
          </p>
        </div>
      </div>
    {/if}
  </div>
</div>
