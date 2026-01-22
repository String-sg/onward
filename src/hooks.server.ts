import type { Handle } from '@sveltejs/kit';

const route_specific_hooks = import.meta.glob('./routes/**/hooks.server.ts') as Record<
  string,
  () => Promise<{ handle: Handle }>
>;

export const handle: Handle = async function handle({ event, resolve }) {
  const hookDir = event.url.pathname.startsWith('/admin') ? '/admin' : '/(main)';
  const importer = route_specific_hooks['./routes' + hookDir + '/hooks.server.ts'];

  if (importer) {
    const module = await importer();
    if (module.handle) {
      return module.handle({ event, resolve });
    }
  }

  return resolve(event);
};
