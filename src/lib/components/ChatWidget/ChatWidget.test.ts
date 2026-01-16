import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { ChatWidget } from './index.js';

describe('ChatWidget', () => {
  test('renders button with aria-label', () => {
    render(ChatWidget, { props: { onclick: vi.fn() } });
    expect(screen.getByRole('button', { name: 'Open chat' })).toBeInTheDocument();
  });

  test('calls onclick when clicked', async () => {
    const user = userEvent.setup();
    const onclick = vi.fn();
    render(ChatWidget, { props: { onclick } });

    await user.click(screen.getByRole('button', { name: 'Open chat' }));
    expect(onclick).toHaveBeenCalledTimes(1);
  });
});
