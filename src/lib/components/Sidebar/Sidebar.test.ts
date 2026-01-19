import { BookOpen, Home, Settings } from '@lucide/svelte';
import { render, screen } from '@testing-library/svelte';
import { describe, expect, test } from 'vitest';

import { Sidebar } from './index.js';

describe('Sidebar', () => {
  const mockNavItems = [
    { href: '/admin', label: 'Dashboard', icon: Home },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
    { href: '/admin/content', label: 'Content', icon: BookOpen },
  ];

  test('renders sidebar title', () => {
    render(Sidebar, {
      props: {
        title: 'Test Admin',
        currentPath: '/admin',
        navItems: mockNavItems,
      },
    });
    expect(screen.getByText('Test Admin')).toBeInTheDocument();
  });

  test('renders all navigation items', () => {
    render(Sidebar, {
      props: {
        title: 'Test Admin',
        currentPath: '/admin',
        navItems: mockNavItems,
      },
    });
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  test('highlights active navigation item', () => {
    const { container } = render(Sidebar, {
      props: {
        title: 'Test Admin',
        currentPath: '/admin/settings',
        navItems: mockNavItems,
      },
    });

    const links = container.querySelectorAll('a');
    const settingsLink = Array.from(links).find((link) => link.textContent?.includes('Settings'));

    expect(settingsLink).toHaveClass('bg-slate-100');
  });

  test('does not highlight inactive navigation items', () => {
    const { container } = render(Sidebar, {
      props: {
        title: 'Test Admin',
        currentPath: '/admin/settings',
        navItems: mockNavItems,
      },
    });

    const links = container.querySelectorAll('a');
    const dashboardLink = Array.from(links).find((link) => link.textContent?.includes('Dashboard'));

    expect(dashboardLink).not.toHaveClass('bg-slate-100');
  });

  test('renders logout link', () => {
    render(Sidebar, {
      props: {
        title: 'Test Admin',
        currentPath: '/admin',
        navItems: mockNavItems,
      },
    });
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  test('logout link has correct href', () => {
    render(Sidebar, {
      props: {
        title: 'Test Admin',
        currentPath: '/admin',
        navItems: mockNavItems,
      },
    });

    const logoutLink = screen.getByText('Logout').closest('a');
    expect(logoutLink).toHaveAttribute('href', '/admin/logout');
  });

  test('navigation items have correct hrefs', () => {
    render(Sidebar, {
      props: {
        title: 'Test Admin',
        currentPath: '/admin',
        navItems: mockNavItems,
      },
    });

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    const settingsLink = screen.getByText('Settings').closest('a');
    const contentLink = screen.getByText('Content').closest('a');

    expect(dashboardLink).toHaveAttribute('href', '/admin');
    expect(settingsLink).toHaveAttribute('href', '/admin/settings');
    expect(contentLink).toHaveAttribute('href', '/admin/content');
  });

  test('applies hover styles to navigation items', () => {
    const { container } = render(Sidebar, {
      props: {
        title: 'Test Admin',
        currentPath: '/admin',
        navItems: mockNavItems,
      },
    });

    const links = container.querySelectorAll('nav a');
    links.forEach((link) => {
      expect(link).toHaveClass('hover:bg-slate-100');
    });
  });
});
