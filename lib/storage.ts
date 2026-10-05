import { S3Client } from "@aws-sdk/client-s3";

const bucket = process.env.NEON_STORAGE_BUCKET;

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const endpoint = process.env.AWS_ENDPOINT_URL_S3;

export const storageConfigured = Boolean(
  bucket && accessKeyId && secretAccessKey && endpoint,
);

const createClient = () =>
  new S3Client({
    region: process.env.AWS_REGION ?? "us-east-2",
    endpoint,
    credentials: { accessKeyId: accessKeyId!, secretAccessKey: secretAccessKey! },
    forcePathStyle: true,
    // Recent SDK versions embed a checksum in presigned URLs computed from an
    // empty body, which rejects uploads that carry real content.
    requestChecksumCalculation: "WHEN_REQUIRED",
  });

const globalForStorage = globalThis as unknown as {
  s3: S3Client | undefined;
};

export const s3 = globalForStorage.s3 ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForStorage.s3 = s3;
}

export function storageBucket() {
  if (!bucket) {
    throw new Error(
      "NEON_STORAGE_BUCKET is not set. Add it to .env (see .env.example)."
    );
  }
  return bucket;
}