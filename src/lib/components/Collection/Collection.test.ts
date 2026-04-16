import { render, screen } from '@testing-library/svelte';
import { describe, expect, test } from 'vitest';

import { Collection } from './index.js';

describe('Collection', () => {
  test('renders as a link with correct href', () => {
    render(Collection, {
      props: { to: '/collection/1', title: 'Test Collection', numberofbites: 1, type: 'AI' },
    });
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/collection/1');
  });

  test('displays title', () => {
    render(Collection, {
      props: { to: '/collection/1', title: 'My Collection', numberofbites: 1, type: 'BOB' },
    });
    expect(screen.getByText('My Collection')).toBeInTheDocument();
  });

  test('displays bite count', () => {
    render(Collection, {
      props: { to: '/collection/1', title: 'Test', numberofbites: 7, type: 'CAREER' },
    });
    expect(screen.getByText('7 bites')).toBeInTheDocument();
  });

  test('applies AI type background class', () => {
    const { container } = render(Collection, {
      props: { to: '/test', title: 'AI Collection', numberofbites: 1, type: 'AI' },
    });
    const link = container.querySelector('a');
    expect(link).toHaveClass('bg-pink-300');
  });

  test('applies BOB type background class', () => {
    const { container } = render(Collection, {
      props: { to: '/test', title: 'BOB Collection', numberofbites: 1, type: 'BOB' },
    });
    const link = container.querySelector('a');
    expect(link).toHaveClass('bg-blue-300');
  });

  test('applies CAREER type background class', () => {
    const { container } = render(Collection, {
      props: { to: '/test', title: 'Career Collection', numberofbites: 1, type: 'CAREER' },
    });
    const link = container.querySelector('a');
    expect(link).toHaveClass('bg-violet-300');
  });

  test('applies PROD type background class', () => {
    const { container } = render(Collection, {
      props: { to: '/test', title: 'Prod Collection', numberofbites: 1, type: 'PROD' },
    });
    const link = container.querySelector('a');
    expect(link).toHaveClass('bg-orange-300');
  });

  test('applies STU_DEV type background class', () => {
    const { container } = render(Collection, {
      props: { to: '/test', title: 'Student Dev', numberofbites: 1, type: 'STU_DEV' },
    });
    const link = container.querySelector('a');
    expect(link).toHaveClass('bg-green-300');
  });

  test('applies WELLBEING type background class', () => {
    const { container } = render(Collection, {
      props: { to: '/test', title: 'Wellbeing', numberofbites: 1, type: 'WELLBEING' },
    });
    const link = container.querySelector('a');
    expect(link).toHaveClass('bg-emerald-300');
  });

  test('applies NEWS type background class', () => {
    const { container } = render(Collection, {
      props: { to: '/test', title: 'News', numberofbites: 1, type: 'NEWS' },
    });
    const link = container.querySelector('a');
    expect(link).toHaveClass('bg-cyan-300');
  });

  test('applies INNOV type background class', () => {
    const { container } = render(Collection, {
      props: { to: '/test', title: 'Innovation', numberofbites: 1, type: 'INNOV' },
    });
    const link = container.querySelector('a');
    expect(link).toHaveClass('bg-pink-300');
  });

  test('applies STU_WELL type background class', () => {
    const { container } = render(Collection, {
      props: { to: '/test', title: 'Student Wellbeing', numberofbites: 1, type: 'STU_WELL' },
    });
    const link = container.querySelector('a');
    expect(link).toHaveClass('bg-green-300');
  });

  test('applies INFRA type background class', () => {
    const { container } = render(Collection, {
      props: { to: '/test', title: 'Infrastructure', numberofbites: 1, type: 'INFRA' },
    });
    const link = container.querySelector('a');
    expect(link).toHaveClass('bg-blue-300');
  });

  test('applies EDU_VOICES type background class', () => {
    const { container } = render(Collection, {
      props: { to: '/test', title: 'Educator Voices', numberofbites: 1, type: 'EDU_VOICES' },
    });
    const link = container.querySelector('a');
    expect(link).toHaveClass('bg-cyan-300');
  });

  test('applies EMP_ENGAGEMENT type background class', () => {
    const { container } = render(Collection, {
      props: {
        to: '/test',
        title: 'Employee Engagement',
        numberofbites: 1,
        type: 'EMP_ENGAGEMENT',
      },
    });
    const link = container.querySelector('a');
    expect(link).toHaveClass('bg-blue-300');
  });
});
