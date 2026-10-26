import { post, putBinary } from "./api";
import { CHUNK_SIZE, encryptChunk, newFileKey, wrapFileKey } from "./fileCrypto";

export async function uploadFile(
  file: File,
  me: { privateKey: CryptoKey; publicKey: string },
  onProgress: (pct: number) => void,
) {
  if (file.size === 0) throw new Error("Empty file not allowed");

  const chunkCount = Math.ceil(file.size / CHUNK_SIZE);
  const fileKey = await newFileKey();
  const { wrappedKey, wrapIv } = await wrapFileKey(fileKey, me.privateKey, me.publicKey);

  const { fileId } = await post("/files/init", {
    name: file.name,
    mimeType: file.type || undefined,
    size: file.size,
    chunkSize: CHUNK_SIZE,
    chunkCount,
    wrappedKey,
    wrapIv,
  });

  for (let i = 0; i < chunkCount; i++) {
    const plain = await file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE).arrayBuffer();
    const enc = await encryptChunk(fileKey, i, plain);
    await putBinary(`/files/${fileId}/chunks/${i}`, enc);
    onProgress(Math.round(((i + 1) / chunkCount) * 100));
  }

  await post(`/files/${fileId}/complete`, {});
  return fileId as string;
}