import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import { Masthead } from './index.js';

describe('Masthead', () => {
  test('renders government agency message', () => {
    render(Masthead);
    expect(screen.getByText(/A Singapore Government Agency Website/)).toBeInTheDocument();
  });

  test('renders "How to identify" button', () => {
    render(Masthead);
    expect(screen.getByText('How to identify')).toBeInTheDocument();
  });

  test('masthead content is hidden by default', () => {
    render(Masthead);
    expect(screen.queryByText(/Official website links end with .gov.sg/)).not.toBeInTheDocument();
  });

  test('shows masthead content when toggle button is clicked', async () => {
    const user = userEvent.setup();
    render(Masthead);

    await user.click(screen.getByText('How to identify'));

    expect(screen.getByText(/Official website links end with .gov.sg/)).toBeInTheDocument();
    expect(screen.getByText(/Secure websites use HTTPS/)).toBeInTheDocument();
    expect(screen.getByText(/Scam alert/)).toBeInTheDocument();
  });

  test('hides masthead content when toggle button is clicked again', async () => {
    const user = userEvent.setup();
    render(Masthead);

    await user.click(screen.getByText('How to identify'));
    expect(screen.getByText(/Official website links end with .gov.sg/)).toBeInTheDocument();

    await user.click(screen.getByText('How to identify'));
    expect(screen.queryByText(/Official website links end with .gov.sg/)).not.toBeInTheDocument();
  });

  test('renders trusted websites link when expanded', async () => {
    const user = userEvent.setup();
    render(Masthead);

    await user.click(screen.getByText('How to identify'));

    const link = screen.getByRole('link', { name: /Trusted websites/i });
    expect(link).toHaveAttribute('href', 'https://www.gov.sg/trusted-sites#govsites');
    expect(link).toHaveAttribute('target', '_blank');
  });
});
