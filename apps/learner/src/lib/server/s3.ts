import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';

import { env } from '$env/dynamic/private';

const BUCKET_NAME = env.S3_BUCKET;
const provider = env.S3_PROVIDER || 'minio';

const client =
  provider === 'minio'
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

export const listObjects = async () => {
  return await client.send(new ListObjectsV2Command({ Bucket: BUCKET_NAME }));
};
