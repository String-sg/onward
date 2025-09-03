import pino, { type LoggerOptions } from 'pino';

import { dev } from '$app/environment';

const options: LoggerOptions = {
  base: null,
  level: 'info',
};

if (dev) {
  options.level = 'debug';
  options.transport = {
    target: 'pino-pretty',
    options: {
      translateTime: 'SYS:standard',
    },
  };
}

export const logger = pino(options);
