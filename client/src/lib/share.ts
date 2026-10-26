import { api, post } from "./api";
import { unwrapFileKey, wrapFileKey } from "./fileCrypto";

export async function shareFile(fileId: string, recipientEmail: string, myPrivate: CryptoKey) {
  const meta = await api(`/files/${fileId}`);
  const fileKey = await unwrapFileKey(meta.wrappedKey, meta.wrapIv, myPrivate, meta.grantedBy.publicKey);

  const rec = await api(`/users/${encodeURIComponent(recipientEmail)}/public-key`);
  const { wrappedKey, wrapIv } = await wrapFileKey(fileKey, myPrivate, rec.publicKey);

  return post(`/files/${fileId}/share`, { recipientEmail, wrappedKey, wrapIv });
}

export const listAcl = (fileId: string) => api(`/files/${fileId}/acl`);

export const revokeAccess = (fileId: string, userId: string) =>
  api(`/files/${fileId}/share/${userId}`, { method: "DELETE" });