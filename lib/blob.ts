import { put, head, del } from "@vercel/blob";

// Thin wrapper — no product usage yet. BLOB_READ_WRITE_TOKEN is injected
// automatically by Vercel once a Blob store is connected to the project;
// @vercel/blob reads it internally at call time, not at import time, so this
// module is build-safe with no env var present.

export async function uploadFile(
  pathname: string,
  body: File | Blob | ArrayBuffer | string
) {
  return put(pathname, body, { access: "public" });
}

export async function getFileMetadata(url: string) {
  return head(url);
}

export async function deleteFile(url: string) {
  return del(url);
}
