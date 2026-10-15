import "server-only"
import {
  S3Client, PutObjectCommand, HeadObjectCommand, GetObjectCommand,
  CopyObjectCommand, DeleteObjectCommand, DeleteObjectsCommand, ListObjectsV2Command,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const Bucket = process.env.S3_BUCKET!

export const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION,
  forcePathStyle: true, // Supabase needs path-style: <endpoint>/<bucket>/<key>
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
})

export const getPublicUrl = (key: string) => `${process.env.S3_PUBLIC_URL}/${key}`

export const createPresignedPut = (key: string, contentType: string) =>
  getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket, Key: key, ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
    { expiresIn: 300 },
  )

export const headObject = (Key: string) => s3.send(new HeadObjectCommand({ Bucket, Key }))

export const readFirstBytes = async (Key: string, n = 16) => {
  const res = await s3.send(new GetObjectCommand({ Bucket, Key, Range: `bytes=0-${n - 1}` }))
  return Buffer.from(await res.Body!.transformToByteArray())
}

export const moveObject = async (from: string, to: string) => {
  await s3.send(new CopyObjectCommand({ Bucket, CopySource: `${Bucket}/${from}`, Key: to }))
  await s3.send(new DeleteObjectCommand({ Bucket, Key: from }))
}

export const deleteObjects = (keys: string[]) =>
  keys.length
    ? s3.send(new DeleteObjectsCommand({ Bucket, Delete: { Objects: keys.map((Key) => ({ Key })) } }))
    : Promise.resolve()

export const listObjects = (Prefix: string, ContinuationToken?: string) =>
  s3.send(new ListObjectsV2Command({ Bucket, Prefix, ContinuationToken }))