import { nanoid } from '$lib/helpers/index.js';

import { valkey } from '../valkey.js';
import Auth from './auth.js';

export * from './google.js';

export const learnerAuth = Auth(valkey, {
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

export const adminAuth = Auth(valkey, {
  session: {
    defaultTimeout: '5m',
    authenticatedTimeout: '1d',
  },
  cookies: {
    session: {
      name: 'admin.session',
    },
    csrf: {
      name: 'admin.csrf',
    },
  },
  generateId: () => nanoid(),
  generateCSRFToken: () => nanoid(),
});
