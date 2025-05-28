import Auth from '@onward/auth';

import { valkey } from './valkey.js';

export const auth = Auth(valkey, {
  cookies: {
    session: {
      name: 'learner.session',
    },
    csrf: {
      name: 'learner.csrf',
    },
  },
});
