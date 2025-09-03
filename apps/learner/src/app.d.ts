/// <reference types="@onward/auth" />

import type { Logger } from 'pino';

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      logger: Logger;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
