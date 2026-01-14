import { render, screen } from '@testing-library/svelte';
import { describe, expect, test } from 'vitest';

import { Footer } from './index.js';

describe('Footer', () => {
  test('renders Terms of Use link', () => {
    render(Footer);
    const link = screen.getByRole('link', { name: 'Terms of Use' });
    expect(link).toHaveAttribute('href', '/terms');
    expect(link).toHaveAttribute('target', '_blank');
  });

  test('renders Privacy Policy link', () => {
    render(Footer);
    const link = screen.getByRole('link', { name: 'Privacy Policy' });
    expect(link).toHaveAttribute('href', '/privacy');
    expect(link).toHaveAttribute('target', '_blank');
  });

  test('renders Report Vulnerability link', () => {
    render(Footer);
    const link = screen.getByRole('link', { name: 'Report Vulnerability' });
    expect(link).toHaveAttribute('href', 'https://tech.gov.sg/report_vulnerability');
    expect(link).toHaveAttribute('target', '_blank');
  });

  test('renders Reach Us link', () => {
    render(Footer);
    const link = screen.getByRole('link', { name: 'Reach Us' });
    expect(link).toHaveAttribute('href', 'https://form.gov.sg/68b7d5099b55d364153be0d5');
    expect(link).toHaveAttribute('target', '_blank');
  });

  test('displays copyright with current year', () => {
    render(Footer);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© ${currentYear}, Government of Singapore`)).toBeInTheDocument();
  });
});
