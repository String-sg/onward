import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import ErrorMessage from './ErrorMessage.svelte';

describe('ErrorMessage', () => {
  it('renders the error message when provided', () => {
    render(ErrorMessage, { props: { message: 'This is an error' } });

    expect(screen.getByText('This is an error')).toBeInTheDocument();
  });

  it('does not render when no message is provided', () => {
    const { container } = render(ErrorMessage);

    expect(container.querySelector('p')).not.toBeInTheDocument();
  });

  it('does not render when message is empty string', () => {
    const { container } = render(ErrorMessage, { props: { message: '' } });

    expect(container.querySelector('p')).not.toBeInTheDocument();
  });

  it('does not render when message is undefined', () => {
    const { container } = render(ErrorMessage, { props: { message: undefined } });

    expect(container.querySelector('p')).not.toBeInTheDocument();
  });

  it('applies default styling classes', () => {
    render(ErrorMessage, { props: { message: 'Error message' } });

    const errorElement = screen.getByText('Error message');
    expect(errorElement).toHaveClass('text-xs', 'text-red-500');
  });

  it('applies custom classes', () => {
    render(ErrorMessage, { props: { message: 'Error message', class: 'custom-class' } });

    const errorElement = screen.getByText('Error message');
    expect(errorElement).toHaveClass('custom-class');
  });

  it('applies both default and custom classes', () => {
    render(ErrorMessage, { props: { message: 'Error message', class: 'mt-2 font-bold' } });

    const errorElement = screen.getByText('Error message');
    expect(errorElement).toHaveClass('text-xs', 'text-red-500', 'mt-2', 'font-bold');
  });

  it('renders as a paragraph element', () => {
    render(ErrorMessage, { props: { message: 'Error message' } });

    const errorElement = screen.getByText('Error message');
    expect(errorElement.tagName).toBe('P');
  });

  it('renders long error messages', () => {
    const longMessage = 'This is a very long error message that might span multiple lines';
    render(ErrorMessage, { props: { message: longMessage } });

    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  it('renders error messages with special characters', () => {
    const specialMessage = 'Error: <Invalid> & "quoted" text';
    render(ErrorMessage, { props: { message: specialMessage } });

    expect(screen.getByText(specialMessage)).toBeInTheDocument();
  });

  it('does not apply custom class when message is not provided', () => {
    const { container } = render(ErrorMessage, { props: { class: 'custom-class' } });

    expect(container.querySelector('.custom-class')).not.toBeInTheDocument();
  });
});
