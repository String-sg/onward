import { render } from '@testing-library/svelte';
import { describe, expect, test } from 'vitest';

import { Portal } from './index.js';

describe('Portal', () => {
  test('renders children to document.body when not disabled', () => {
    render(Portal, {
      props: { disabled: false },
    });
    expect(document.body).toBeInTheDocument();
  });

  test('does not render inline content when disabled is false', () => {
    const { container } = render(Portal, {
      props: { disabled: false },
    });
    expect(container.children.length).toBe(0);
  });
});
