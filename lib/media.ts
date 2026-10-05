import { prisma } from "@/lib/prisma";
import { storageBucket, storageConfigured, s3 } from "@/lib/storage";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

/**
 * Uploads a media file to Neon Object Storage (S3-compatible).
 *
 * Returns a presigned URL so private buckets can be served without exposing
 * credentials.
 */
export async function uploadObject(
  file: { name: string; type: string; data: Uint8Array },
  options: { folder?: string } = {}
): Promise<{ key: string; url: string }> {
  if (!storageConfigured) {
    throw new Error(
      "Neon Object Storage is not configured. Set AWS_ENDPOINT_URL_S3, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY and NEON_STORAGE_BUCKET."
    );
  }

  const bucket = storageBucket();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const key = `${options.folder ?? "uploads"}/${randomUUID()}-${safeName}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file.data,
      ContentType: file.type || "application/octet-stream",
    })
  );

  const url = await presignGetObject(key);

  return { key, url };
}

export async function deleteObject(key: string): Promise<void> {
  if (!storageConfigured) return;

  await s3.send(
    new DeleteObjectCommand({ Bucket: storageBucket(), Key: key })
  );
}

export async function presignGetObject(key: string, expiresIn = 3600): Promise<string> {
  const { GetObjectCommand } = await import("@aws-sdk/client-s3");
  const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: storageBucket(), Key: key }),
    { expiresIn }
  );
}

/** Tracks whether an object for this key is already stored. */
export async function objectExists(key: string): Promise<boolean> {
  if (!storageConfigured) return false;

  try {
    const { HeadObjectCommand } = await import("@aws-sdk/client-s3");
    await s3.send(new HeadObjectCommand({ Bucket: storageBucket(), Key: key }));
    return true;
  } catch {
    return false;
  }
}

export { prisma };