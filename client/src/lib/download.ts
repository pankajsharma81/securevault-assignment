import { api, getBinary } from "./api";
import { decryptChunk, unwrapFileKey } from "./fileCrypto";

export async function downloadFile(
  fileId: string,
  privateKey: CryptoKey,
  onProgress: (pct: number) => void,
) {
  const meta = await api(`/files/${fileId}`);
  const fileKey = await unwrapFileKey(meta.wrappedKey, meta.wrapIv, privateKey, meta.grantedBy.publicKey);

  const parts: ArrayBuffer[] = [];
  for (let i = 0; i < meta.chunkCount; i++) {
    const enc = await getBinary(`/files/${fileId}/chunks/${i}`);
    parts.push(await decryptChunk(fileKey, i, enc));
    onProgress(Math.round(((i + 1) / meta.chunkCount) * 100));
  }

  const blob = new Blob(parts, { type: meta.mimeType || "application/octet-stream" });
  return { name: meta.name as string, mimeType: meta.mimeType as string, blob };
}