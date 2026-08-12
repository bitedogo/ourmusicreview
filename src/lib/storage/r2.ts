/** Cloudflare R2 (S3 호환) 공개 객체 업로드 */

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getR2Env } from "@/src/lib/env";

let client: S3Client | null = null;

function getR2Client(): S3Client {
  if (client) return client;
  const env = getR2Env();
  client = new S3Client({
    region: "auto",
    endpoint: `https://${env.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.accessKeyId,
      secretAccessKey: env.secretAccessKey,
    },
  });
  return client;
}

export async function putPublicObject(params: {
  key: string;
  body: Buffer | Uint8Array;
  contentType: string;
  cacheControl?: string;
}): Promise<string> {
  const env = getR2Env();
  await getR2Client().send(
    new PutObjectCommand({
      Bucket: env.bucket,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
      CacheControl: params.cacheControl ?? "public, max-age=31536000",
    })
  );

  const base = env.publicBaseUrl.replace(/\/$/, "");
  return `${base}/${params.key}`;
}
