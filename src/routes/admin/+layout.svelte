<script lang="ts">
  import '../../app.css';

  import { BookOpen } from '@lucide/svelte';

  import { page } from '$app/state';
  import { Sidebar } from '$lib/components/Sidebar/index.js';

  let { children } = $props();

  const navItems = [{ href: '/admin', label: 'Learning Units', icon: BookOpen }];
</script>

<div class="flex h-screen overflow-hidden">
  <Sidebar title="Glow Admin" currentPath={page.url.pathname} {navItems} />

  <main class="flex-1 overflow-y-auto p-6">
    {@render children()}
  </main>
</div>
