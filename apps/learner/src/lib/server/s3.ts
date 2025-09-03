import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';

import { env } from '$env/dynamic/private';

const BUCKET_NAME = env.AWS_S3_BUCKET;
const isProduction = env.NODE_ENV === 'production';

const initS3Client = () => {
  if (isProduction) {
    return new S3Client();
  }

  return new S3Client({
    region: 'ap-southeast-1',
    endpoint: 'http://localhost:9000',
    forcePathStyle: true,
    credentials: {
      accessKeyId: 'minioadmin',
      secretAccessKey: 'minioadmin',
    },
  });
};

const s3Client = initS3Client();

export const listObjects = async () => {
  return await s3Client.send(new ListObjectsV2Command({ Bucket: BUCKET_NAME }));
};
