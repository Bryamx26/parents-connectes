import {
  CreateBucketCommand, DeleteObjectsCommand, GetObjectCommand, HeadBucketCommand, PutObjectCommand,
} from '@aws-sdk/client-s3';
import { bucket, s3 } from '../config/s3.js';

export async function ensureBucket() {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucket }));
  } catch {
    await s3.send(new CreateBucketCommand({ Bucket: bucket })); // bucket privé par défaut
  }
}

export async function put(key, body, contentType) {
  await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }));
}

export async function get(key) {
  const res = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  return { body: res.Body, contentType: res.ContentType, length: res.ContentLength };
}

// Après une suppression en base : un objet orphelin dans MinIO n'est pas grave, on journalise seulement.
export async function removeMany(keys) {
  if (!keys.length) return;
  try {
    await s3.send(new DeleteObjectsCommand({
      Bucket: bucket, Delete: { Objects: keys.map((Key) => ({ Key })), Quiet: true },
    }));
  } catch (err) {
    console.error('Suppression MinIO impossible', keys, err.message);
  }
}
