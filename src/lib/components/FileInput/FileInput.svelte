<script lang="ts">
  import { CloudUpload, FileIcon, XIcon } from '@lucide/svelte';
  import type {
    ChangeEventHandler,
    DragEventHandler,
    HTMLInputAttributes,
    KeyboardEventHandler,
    MouseEventHandler,
  } from 'svelte/elements';

  export interface Props extends Omit<HTMLInputAttributes, 'type' | 'class' | 'accept'> {
    /**
     * The accepted file types.
     *
     * examples: 'audio/*', '.mp3,.wav'
     */
    accept?: string;
  }

  const { accept, ...restProps }: Props = $props();

  let fileInput: HTMLInputElement;
  let isDragging = $state(false);
  let selectedFile = $state<File | null>(null);

  const isFileValid = (file: File): boolean => {
    if (!accept) return true;

    const acceptedFileTypes = accept.split(',').map((t) => t.trim());
    const fileType = file.type;
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();

    return acceptedFileTypes.some((type) => {
      // wildcards: 'audio/*', 'image/*'
      if (type.endsWith('/*')) {
        return fileType.startsWith(type.replace('/*', ''));
      }
      // MIME types or extensions: 'application/pdf', '.pdf'
      return type.toLowerCase() === fileType || type.toLowerCase() === fileExt;
    });
  };

  const formatFileSize = (bytes: number): string => {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleFilePicker: MouseEventHandler<HTMLDivElement> = () => {
    fileInput.click();
  };

  const handleDragOver: DragEventHandler<HTMLElement> = (event) => {
    event.preventDefault();
    isDragging = true;
  };

  const handleDragLeave: DragEventHandler<HTMLElement> = (event) => {
    event.preventDefault();
    isDragging = false;
  };

  const handleDrop: DragEventHandler<HTMLElement> = (event) => {
    event.preventDefault();
    isDragging = false;

    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    if (!isFileValid(file)) {
      return;
    }

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;
    selectedFile = file;
  };

  const handleDeleteFile: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    fileInput.value = '';
    selectedFile = null;
  };

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = () => {
    selectedFile = fileInput.files?.[0] ?? null;
  };

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (event.key === 'Enter') {
      fileInput.click();
    }
  };
</script>

<div
  role="button"
  tabindex="0"
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
  onclick={handleFilePicker}
  onkeydown={handleKeyDown}
  class={[
    'relative cursor-pointer rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-6 transition-all hover:border-slate-400 hover:bg-slate-100 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed',
    isDragging && 'border-slate-500 bg-slate-100',
  ]}
>
  <input
    bind:this={fileInput}
    type="file"
    {accept}
    onchange={handleFileChange}
    class="hidden"
    {...restProps}
  />

  {#if !selectedFile}
    <div class="flex flex-col items-center justify-center">
      <CloudUpload class="size-12 text-slate-400" />
      <span class="text-sm text-slate-900">Drag and drop file here, or click to browse.</span>
      <span class="mt-1 text-xs text-slate-500">
        {accept ? `Accepts: ${accept}` : 'Any file type'}
      </span>
    </div>
  {:else}
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <FileIcon class="size-6 text-slate-600" />
        {selectedFile.name}
        <span class="text-sm text-slate-500">{formatFileSize(selectedFile.size)}</span>
      </div>

      <button
        type="button"
        onclick={handleDeleteFile}
        aria-label="Remove file"
        class="rounded-full text-slate-400 transition-transform delay-100 duration-300 ease-in-out hover:scale-120"
      >
        <XIcon class="size-5" />
      </button>
    </div>
  {/if}
</div>
