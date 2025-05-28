import { type GlideClient, TimeUnit } from '@valkey/valkey-glide';
import { safeDestr } from 'destr';
import { nanoid } from 'nanoid';

import { mask } from './utils/mask';

/**
 * The default length of the session ID.
 */
const DEFAULT_SESSION_ID_LENGTH = 32;
/**
 * The default length of the CSRF token.
 */
const DEFAULT_CSRF_TOKEN_LENGTH = 32;

type JSONPrimitive = string | number | boolean | null;
type JSONValue = JSONPrimitive | JSONValue[] | JSONObject;
type JSONObject = { [Key in string]: JSONValue };

interface SessionData extends JSONObject {
  id: string;
  csrfToken: string;
  userId: string | number | null;
}

export default class Session {
  #data: SessionData;

  private constructor(data: SessionData) {
    this.#data = data;
  }

  /**
   * Creates a new {@link Session} instance.
   *
   * @returns A new {@link Session} instance.
   */
  static create(
    options: { generateId?: () => string; generateCSRFToken?: () => string } = {},
  ): Session {
    return new Session({
      id: options.generateId?.() ?? nanoid(DEFAULT_SESSION_ID_LENGTH),
      csrfToken: options.generateCSRFToken?.() ?? nanoid(DEFAULT_CSRF_TOKEN_LENGTH),
      userId: null,
    });
  }

  /**
   * Prepares a {@link Session} instance by retrieving it from Valkey using the provided key. If
   * the key is empty or the stored session data is invalid or missing, a new session is created
   * and returned.
   *
   * @param valkey - The Valkey client.
   * @param key - The key to use to retrieve the session data from Valkey.
   * @param options.namespace - An optional namespace to prefix the key with.
   * @returns A valid {@link Session} instance, either retrieved from Valkey or newly created.
   */
  static async prepare(
    valkey: GlideClient,
    key: string,
    options: { namespace?: string } = {},
  ): Promise<Session | null> {
    if (!key.length) {
      return null;
    }

    key = options.namespace ? `${options.namespace}:${key}` : key;
    const value = await valkey.get(key);
    if (!value) {
      return null;
    }

    let data: JSONValue;
    try {
      data = safeDestr(value.toString());
    } catch {
      return null;
    }

    if (!isSessionData(data)) {
      return null;
    }

    return new Session(data);
  }

  /**
   * Commits the {@link Session} instance to Valkey using the session's ID as the key.
   *
   * @param valkey - The Valkey client.
   * @param session - The {@link Session} instance to commit.
   * @param options.namespace - An optional namespace to prefix the key with.
   * @param options.ttl - An optional time-to-live (TTL) for the session in seconds. If not provided, the session will **NOT** expire.
   */
  static async commit(
    valkey: GlideClient,
    session: Session,
    options: { namespace?: string; ttl?: number } = {},
  ): Promise<void> {
    if (!session.#data.id || !session.#data.csrfToken) {
      return;
    }

    const key = options.namespace ? `${options.namespace}:${session.#data.id}` : session.#data.id;
    const value = JSON.stringify(session.#data);

    await valkey.set(
      key,
      value,
      options.ttl
        ? {
            expiry: { type: TimeUnit.Seconds, count: options.ttl },
          }
        : undefined,
    );
  }

  /**
   * The unique identifier for the session.
   */
  get id(): string {
    return this.#data.id;
  }

  /**
   * Whether the session is authenticated.
   */
  get isAuthenticated(): boolean {
    return !!this.#data.userId;
  }

  /**
   * Returns a masked CSRF token for use in forms.
   *
   * @returns A masked version of the current CSRF token.
   */
  csrfToken(): string {
    return mask(this.#data.csrfToken);
  }
}

/**
 * Checks if the data is a valid {@link SessionData} object.
 *
 * @param data - The data to check.
 * @returns `true` if the data is a valid {@link SessionData} object. Otherwise, returns `false`.
 */
function isSessionData(data: JSONValue): data is SessionData {
  return data &&
    typeof data === 'object' &&
    'id' in data &&
    typeof data['id'] === 'string' &&
    'csrfToken' in data &&
    typeof data['csrfToken'] === 'string' &&
    'userId' in data &&
    (typeof data['userId'] === 'string' ||
      typeof data['userId'] === 'number' ||
      data['userId'] === null)
    ? true
    : false;
}
