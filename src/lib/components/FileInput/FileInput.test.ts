import { fireEvent, render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import FileInput from './FileInput.svelte';

describe('FileInput', () => {
  it('renders the drop zone', () => {
    render(FileInput);

    expect(screen.getByText('Drag and drop file here, or click to browse.')).toBeInTheDocument();
  });

  it('shows default accepted file types when there is no accept prop', () => {
    render(FileInput);

    expect(screen.getByText('Any file type')).toBeInTheDocument();
  });

  it('shows accepted file types', () => {
    render(FileInput, { props: { accept: 'audio/*' } });

    expect(screen.getByText('Accepts: audio/*')).toBeInTheDocument();
  });

  it('displays file name and size when selected', async () => {
    const user = userEvent.setup();
    render(FileInput);

    const content = 'x'.repeat(1024 * 1024);
    const file = new File([content], 'test-file.mp3', { type: 'audio/mpeg' });
    const input = screen
      .getByRole('button')
      .querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(input, file);

    expect(screen.getByText('test-file.mp3')).toBeInTheDocument();
    expect(screen.getByText('1.0 MB')).toBeInTheDocument();
  });

  it('formats file size to MB', async () => {
    const user = userEvent.setup();
    render(FileInput);

    const file = new File(['x'.repeat(1024 * 1024)], 'test.txt', { type: 'text/plain' });
    const input = screen
      .getByRole('button')
      .querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(input, file);

    expect(screen.getByText('1.0 MB')).toBeInTheDocument();
  });

  it('shows the remove button when file is selected', async () => {
    const user = userEvent.setup();
    render(FileInput);
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const input = screen
      .getByRole('button')
      .querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(input, file);

    expect(screen.getByRole('button', { name: 'Remove file' })).toBeInTheDocument();
  });

  it('removes the file when remove button is clicked', async () => {
    const user = userEvent.setup();
    render(FileInput);

    await user.upload(
      screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement,
      new File(['test'], 'test.txt', { type: 'text/plain' }),
    );
    expect(screen.getByText('test.txt')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remove file' }));

    expect(screen.getByText('Drag and drop file here, or click to browse.')).toBeInTheDocument();
  });

  it('opens file dialog when clicking the upload area', async () => {
    const user = userEvent.setup();
    render(FileInput);
    const uploadArea = screen.getByRole('button');
    const clickSpy = vi.spyOn(
      uploadArea.querySelector('input[type="file"]') as HTMLInputElement,
      'click',
    );

    await user.click(uploadArea);

    expect(clickSpy).toHaveBeenCalled();
  });

  it('opens file dialog when pressing Enter', async () => {
    const user = userEvent.setup();
    render(FileInput);
    const uploadArea = screen.getByRole('button');
    const clickSpy = vi.spyOn(
      uploadArea.querySelector('input[type="file"]') as HTMLInputElement,
      'click',
    );

    uploadArea.focus();
    await user.keyboard('{Enter}');

    expect(clickSpy).toHaveBeenCalled();
  });

  it('highlights border when dragging file over drop zone', async () => {
    render(FileInput);
    const uploadArea = screen.getByRole('button');

    await fireEvent.dragOver(uploadArea);

    expect(uploadArea).toHaveClass('border-slate-500', 'bg-slate-100');
  });

  it('returns border to default when drag leaves drop zone', async () => {
    render(FileInput);

    const uploadArea = screen.getByRole('button');

    await fireEvent.dragOver(uploadArea);
    expect(uploadArea).toHaveClass('border-slate-500', 'bg-slate-100');

    await fireEvent.dragLeave(uploadArea);
    expect(uploadArea).toHaveClass('border-slate-300', 'bg-slate-50');
  });
});
