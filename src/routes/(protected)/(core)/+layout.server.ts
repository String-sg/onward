import { redirect } from '@sveltejs/kit';

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  const user = locals.session?.user;

  if (!user) throw redirect(303, '/login');

  return {
    userAvatar: user.avatarURL,
  };
};
