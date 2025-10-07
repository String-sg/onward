import { nanoid } from '$lib/helpers/index.js';

import { valkey } from '../valkey.js';
import Auth from './auth.js';

export * from './google.js';
export type { default as Session } from './session.js';

export default Auth(valkey, {
  cookies: {
    session: {
      name: 'learner.session',
    },
    csrf: {
      name: 'learner.csrf',
    },
  },
  generateId: () => nanoid(),
  generateCSRFToken: () => nanoid(),
});
