import { S3Client } from '@aws-sdk/client-s3';
import { env } from './env.js';

export const bucket = env.s3.bucket;

export const s3 = new S3Client({
  endpoint: env.s3.endpoint,
  region: env.s3.region,
  credentials: { accessKeyId: env.s3.accessKeyId, secretAccessKey: env.s3.secretAccessKey },
  forcePathStyle: true, // MinIO
});
