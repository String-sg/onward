import { Readable } from 'node:stream';

import {
  GetObjectCommand,
  NoSuchKey,
  NotFound,
  S3Client,
  S3ServiceException,
} from '@aws-sdk/client-s3';

import { env } from '$env/dynamic/private';

const BUCKET = env.S3_BUCKET || 'onward';
const PROVIDER = env.S3_PROVIDER || 'minio';

const client =
  PROVIDER === 'minio'
    ? new S3Client({
        credentials: {
          accessKeyId: env.S3_ACCESS_KEY || 'minioaccesskey',
          secretAccessKey: env.S3_SECRET_KEY || 'miniosecretkey',
        },
        endpoint: env.S3_ENDPOINT || 'http://localhost:9000',
        region: env.S3_REGION || 'ap-southeast-1',
        forcePathStyle: true,
      })
    : new S3Client();

/**
 * Retrieves an object from S3 with the given key. If the object does not exist, `null` is returned.
 * If the range is not satisfiable, a {@link RangeNotSatisfiableError} is thrown.
 *
 * @param key - The key of the object to get.
 * @param opts.range - An optional range to retrieve a portion of the object.
 * @returns The object from S3, or `null` if the object does not exist.
 */
export async function getPodcastObject(
  key: string,
  opts: { range?: string | null } = {},
): Promise<{
  stream: ReadableStream;
  headers: Record<string, string>;
} | null> {
  try {
    const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key, Range: opts.range ?? undefined });
    const res = await client.send(cmd);

    if (!res.Body || !(res.Body instanceof Readable)) {
      return null;
    }

    const stream = Readable.toWeb(res.Body);
    if (!(stream instanceof ReadableStream)) {
      return null;
    }

    const headers: Record<string, string> = {};
    if (res.ContentType) {
      headers['Content-Type'] = res.ContentType;
    }
    if (res.ContentLength) {
      headers['Content-Length'] = String(res.ContentLength);
    }
    if (res.AcceptRanges) {
      headers['Accept-Ranges'] = res.AcceptRanges;
    }
    if (res.ContentRange) {
      headers['Content-Range'] = res.ContentRange;
    }
    if (res.LastModified) {
      headers['Last-Modified'] = res.LastModified.toUTCString();
    }
    if (res.ETag) {
      headers['ETag'] = res.ETag;
    }

    return { stream, headers };
  } catch (err) {
    if (err instanceof NoSuchKey || err instanceof NotFound) {
      return null;
    }
    if (err instanceof S3ServiceException && err.$metadata.httpStatusCode === 416) {
      throw new RangeNotSatisfiableError();
    }

    throw err;
  }
}

/**
 * The base class for all S3 errors.
 */
export class BaseError extends Error {
  constructor(message: string) {
    super(message);

    this.name = this.constructor.name;
  }
}

/**
 * Thrown when a requested range is not satisfiable.
 */
export class RangeNotSatisfiableError extends BaseError {
  constructor() {
    super('Requested range not satisfiable');
  }
}
