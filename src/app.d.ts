import type { Session } from '$lib/server/auth/index.js';
import type { Logger } from '$lib/server/logger.js';

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      session: Session;
      logger: Logger;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
