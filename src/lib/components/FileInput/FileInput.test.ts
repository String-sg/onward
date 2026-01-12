import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import FileInput from './FileInput.svelte';

describe('FileInput', () => {
  it('renders the upload area', () => {
    render(FileInput);

    expect(screen.getByText(/drag and drop file here/i)).toBeInTheDocument();
  });

  it('renders with accept attribute', () => {
    render(FileInput, { props: { accept: 'audio/*' } });

    expect(screen.getByText(/accepts: audio\/\*/i)).toBeInTheDocument();
  });

  it('shows "Any file type" when no accept attribute provided', () => {
    render(FileInput);

    expect(screen.getByText(/any file type/i)).toBeInTheDocument();
  });

  it('applies custom classes to the container', () => {
    const { container } = render(FileInput, { props: { class: 'custom-class' } });

    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('shows file information when file is selected', async () => {
    render(FileInput);

    const file = new File(['test content'], 'test-file.txt', { type: 'text/plain' });
    const input = screen
      .getByRole('button')
      .querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });

    await fireEvent.change(input);

    expect(screen.getByText('test-file.txt')).toBeInTheDocument();
    expect(screen.getByText(/B/)).toBeInTheDocument();
  });

  it('formats file size correctly - bytes', async () => {
    render(FileInput);

    const file = new File(['x'.repeat(500)], 'test.txt', { type: 'text/plain' });
    const input = screen
      .getByRole('button')
      .querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });

    await fireEvent.change(input);

    expect(screen.getByText(/500 B/)).toBeInTheDocument();
  });

  it('formats file size correctly - kilobytes', async () => {
    render(FileInput);

    const file = new File(['x'.repeat(2048)], 'test.txt', { type: 'text/plain' });
    const input = screen
      .getByRole('button')
      .querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });

    await fireEvent.change(input);

    expect(screen.getByText(/2\.0 KB/)).toBeInTheDocument();
  });

  it('formats file size correctly - megabytes', async () => {
    render(FileInput);

    const content = 'x'.repeat(2 * 1024 * 1024);
    const file = new File([content], 'test.txt', { type: 'text/plain' });
    const input = screen
      .getByRole('button')
      .querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });

    await fireEvent.change(input);

    expect(screen.getByText(/2\.0 MB/)).toBeInTheDocument();
  });

  it('shows clear button when file is selected', async () => {
    render(FileInput);

    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const input = screen
      .getByRole('button')
      .querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });

    await fireEvent.change(input);

    expect(screen.getByLabelText(/clear selected file/i)).toBeInTheDocument();
  });

  it('clears the file when clear button is clicked', async () => {
    render(FileInput);

    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const input = screen
      .getByRole('button')
      .querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(input, 'files', {
      value: [file],
      writable: true,
      configurable: true,
    });

    await fireEvent.change(input);
    expect(screen.getByText('test.txt')).toBeInTheDocument();

    Object.defineProperty(input, 'files', {
      value: null,
      writable: true,
      configurable: true,
    });

    const clearButton = screen.getByLabelText(/clear selected file/i);
    await fireEvent.click(clearButton);

    await waitFor(() => {
      expect(screen.queryByText('test.txt')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/drag and drop file here/i)).toBeInTheDocument();
  });

  it('opens file dialog when clicking the upload area', async () => {
    render(FileInput);

    const uploadArea = screen.getByRole('button');
    const input = uploadArea.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');

    await fireEvent.click(uploadArea);

    expect(clickSpy).toHaveBeenCalled();
  });

  it('opens file dialog when pressing Enter', async () => {
    render(FileInput);

    const uploadArea = screen.getByRole('button');
    const input = uploadArea.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');

    await fireEvent.keyDown(uploadArea, { key: 'Enter' });

    expect(clickSpy).toHaveBeenCalled();
  });

  it('opens file dialog when pressing Space', async () => {
    render(FileInput);

    const uploadArea = screen.getByRole('button');
    const input = uploadArea.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');

    await fireEvent.keyDown(uploadArea, { key: ' ' });

    expect(clickSpy).toHaveBeenCalled();
  });

  it('handles drag over event', async () => {
    render(FileInput);

    const uploadArea = screen.getByRole('button');

    await fireEvent.dragOver(uploadArea);

    expect(uploadArea).toHaveClass('border-slate-500', 'bg-slate-100');
  });

  it('handles drag leave event', async () => {
    render(FileInput);

    const uploadArea = screen.getByRole('button');

    await fireEvent.dragOver(uploadArea);
    expect(uploadArea).toHaveClass('border-slate-500', 'bg-slate-100');

    await fireEvent.dragLeave(uploadArea);
    expect(uploadArea).toHaveClass('border-slate-300', 'bg-slate-50');
  });

  it('passes through additional HTML attributes', () => {
    render(FileInput, { props: { id: 'custom-id', name: 'custom-name', required: true } });

    const input = screen
      .getByRole('button')
      .querySelector('input[type="file"]') as HTMLInputElement;

    expect(input).toHaveAttribute('id', 'custom-id');
    expect(input).toHaveAttribute('name', 'custom-name');
    expect(input).toHaveAttribute('required');
  });

  it('displays "Drop file here" message when dragging', async () => {
    render(FileInput);

    const uploadArea = screen.getByRole('button');

    await fireEvent.dragOver(uploadArea);

    expect(screen.getByText(/drop file here/i)).toBeInTheDocument();
  });
});
