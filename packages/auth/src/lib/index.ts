import type { Handle } from '@sveltejs/kit';
import type { GlideClient } from '@valkey/valkey-glide';
import { nanoid } from 'nanoid';

import { env } from '$env/dynamic/private';

import Session from './session';
import parseDuration from './utils/duration';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace App {
    interface Locals {
      session: Session;
    }
  }
}

type PartialDeep<T> = T extends () => unknown
  ? T
  : T extends object
    ? {
        [Key in keyof T]?: T[Key] extends object ? PartialDeep<T[Key]> : T[Key];
      }
    : never;

export interface AuthOptions {
  session: {
    /**
     * The duration an unauthenticated session remains valid before expiring.
     *
     * Accepts a number (seconds) or a duration string consisting of one or more time units.
     * Each time unit is an integer (up to 5 digits) followed by a unit character:
     * - `d` = days
     * - `h` = hours
     * - `m` = minutes
     * - `s` = seconds
     *
     * Examples:
     * - 3600        // 1 hour in seconds
     * - '3h'        // 3 hours
     * - '1h30m'     // 1 hour and 30 minutes
     *
     * @default '3h'
     */
    defaultTimeout: string | number;
    /**
     * The duration an authenticated session remains valid before expiring.
     *
     * Accepts a number (seconds) or a duration string consisting of one or more time units.
     * Each time unit is an integer (up to 5 digits) followed by a unit character:
     * - `d` = days
     * - `h` = hours
     * - `m` = minutes
     * - `s` = seconds
     *
     * Examples:
     * - 86400       // 1 day in seconds
     * - '7d'        // 7 days
     * - '1h30m'     // 1 hour and 30 minutes
     *
     * @default '7d'
     */
    authenticatedTimeout: string | number;
  };
  cookies: {
    session: {
      /**
       * The name of the session cookie.
       *
       * @default 'auth.session'
       */
      name: string;
      /**
       * The options for the session cookie.
       *
       * @default
       * {
       *   path: '/',
       *   httpOnly: true,
       *   secure: process.env.NODE_ENV === 'production',
       *   sameSite: 'lax',
       * }
       */
      options: {
        path: string;
        httpOnly: boolean;
        secure: boolean;
        sameSite: 'lax' | 'strict' | 'none';
      };
    };
    csrf: {
      /**
       * The name of the CSRF cookie.
       *
       * @default 'auth.csrf'
       */
      name: string;
      /**
       * The options for the CSRF cookie.
       *
       * @default
       * {
       *   path: '/',
       *   httpOnly: true,
       *   secure: process.env.NODE_ENV === 'production',
       *   sameSite: 'lax',
       * }
       */
      options: {
        path: string;
        httpOnly: boolean;
        secure: boolean;
        sameSite: 'lax' | 'strict' | 'none';
      };
    };
  };
  /**
   * The namespace used for storing session data in Valkey.
   * This value is prepended to all session keys to avoid collisions with other data.
   *
   * @default 'auth:session'
   */
  namespace: string;
  /**
   * A function to generate a session ID.
   *
   * @default () => nanoid(32)
   */
  generateId: () => string;
  /**
   * A function to generate a CSRF token.
   *
   * @default () => nanoid(32)
   */
  generateCSRFToken: () => string;
}

export interface AuthResult {
  handle: Handle;
}

/**
 * The default session timeout for unauthenticated sessions.
 */
const DEFAULT_SESSION_DEFAULT_TIMEOUT: Extract<AuthOptions['session']['defaultTimeout'], string> =
  '3h';
/**
 * The default session timeout for authenticated sessions.
 */
const DEFAULT_SESSION_AUTHENTICATED_TIMEOUT: Extract<
  AuthOptions['session']['authenticatedTimeout'],
  string
> = '7d';

/**
 * The default name for the session cookie.
 */
const DEFAULT_COOKIES_SESSION_NAME: AuthOptions['cookies']['session']['name'] = 'auth.session';
/**
 * The default options for the session cookie.
 */
const DEFAULT_COOKIES_SESSION_OPTIONS: AuthOptions['cookies']['session']['options'] = {
  path: '/',
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
};

/**
 * The default name for the CSRF cookie.
 */
const DEFAULT_COOKIES_CSRF_NAME: AuthOptions['cookies']['csrf']['name'] = 'auth.csrf';
/**
 * The default options for the CSRF cookie.
 */
const DEFAULT_COOKIES_CSRF_OPTIONS: AuthOptions['cookies']['csrf']['options'] = {
  path: '/',
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
};

/**
 * The default namespace used for storing session data in Valkey.
 */
const DEFAULT_NAMESPACE: AuthOptions['namespace'] = 'auth:session';

/**
 * The default function to generate a session ID.
 */
const DEFAULT_GENERATE_ID: AuthOptions['generateId'] = () => nanoid(32);
/**
 * The default function to generate a CSRF token.
 */
const DEFAULT_GENERATE_CSRF_TOKEN: AuthOptions['generateCSRFToken'] = () => nanoid(32);

/**
 * Initialise the authentication module for SvelteKit.
 *
 * Example:
 * ```ts
 * // src/lib/server/auth.ts
 * import Auth from "@onward/auth";
 * import { valkey } from './valkey.js';
 *
 * export const auth = Auth(valkey);
 *
 * // src/hooks.server.ts
 * import type { Handle } from '@sveltejs/kit';
 * import { sequence } from '@sveltejs/kit/hooks';
 * import { auth } from '$lib/auth';
 *
 * export const handle: Handle = sequence(auth.handle);
 * ```
 *
 * @param valkey - The Valkey client instance.
 * @param options - An options to override the default configuration.
 * @returns A set of functions that set up authentication middleware and utilities to interact with the session in SvelteKit.
 */
export default function Auth(valkey: GlideClient, options?: PartialDeep<AuthOptions>): AuthResult {
  const defaultTimeout = options?.session?.defaultTimeout
    ? typeof options.session.defaultTimeout === 'number'
      ? options.session.defaultTimeout
      : parseDuration(options.session.defaultTimeout)
    : parseDuration(DEFAULT_SESSION_DEFAULT_TIMEOUT);
  if (!defaultTimeout) {
    throw new InvalidAuthOptionsError(
      `Failed to parse "session.defaultTimeout": ${options?.session?.defaultTimeout}. Expected a duration string like "3h".`,
    );
  }

  const authenticatedTimeout = options?.session?.authenticatedTimeout
    ? typeof options.session.authenticatedTimeout === 'number'
      ? options.session.authenticatedTimeout
      : parseDuration(options.session.authenticatedTimeout)
    : parseDuration(DEFAULT_SESSION_AUTHENTICATED_TIMEOUT);
  if (!authenticatedTimeout) {
    throw new InvalidAuthOptionsError(
      `Failed to parse "session.authenticatedTimeout": ${options?.session?.authenticatedTimeout}. Expected a duration string like "7d".`,
    );
  }

  const opts = {
    session: {
      defaultTimeout,
      authenticatedTimeout,
    },
    cookies: {
      session: {
        name: options?.cookies?.session?.name ?? DEFAULT_COOKIES_SESSION_NAME,
        options: {
          ...DEFAULT_COOKIES_SESSION_OPTIONS,
          ...options?.cookies?.session?.options,
        },
      },
      csrf: {
        name: options?.cookies?.csrf?.name ?? DEFAULT_COOKIES_CSRF_NAME,
        options: {
          ...DEFAULT_COOKIES_CSRF_OPTIONS,
          ...options?.cookies?.csrf?.options,
        },
      },
    },
    namespace: options?.namespace ?? DEFAULT_NAMESPACE,
    generateId: options?.generateId ?? DEFAULT_GENERATE_ID,
    generateCSRFToken: options?.generateCSRFToken ?? DEFAULT_GENERATE_CSRF_TOKEN,
  } satisfies AuthOptions;

  return {
    handle: async ({ event, resolve }) => {
      const sid = event.cookies.get(opts.cookies.session.name);

      const session =
        (sid ? await Session.prepare(valkey, sid, { namespace: opts.namespace }) : null) ??
        Session.create({
          generateId: opts.generateId,
          generateCSRFToken: opts.generateCSRFToken,
        });

      event.locals.session = session;

      // Set the session cookie.
      event.cookies.set(opts.cookies.session.name, session.id, {
        ...opts.cookies.session.options,
        maxAge: session.isAuthenticated
          ? opts.session.authenticatedTimeout
          : opts.session.defaultTimeout,
      });

      // Set the CSRF cookie.
      event.cookies.set(opts.cookies.csrf.name, session.csrfToken(), {
        ...opts.cookies.csrf.options,
      });

      const response = await resolve(event);

      await Session.commit(valkey, session, {
        namespace: opts.namespace,
        ttl: session.isAuthenticated
          ? opts.session.authenticatedTimeout
          : opts.session.defaultTimeout,
      });

      return response;
    },
  };
}

/**
 * An error thrown when the options to configure {@link Auth} are invalid.
 */
export class InvalidAuthOptionsError extends Error {
  constructor(message: string) {
    super(message);

    this.name = this.constructor.name;
  }
}
