import { toB64, fromB64 } from "./b64";

const subtle = crypto.subtle;
const ECDH = { name: "ECDH", namedCurve: "P-256" } as const;

export const CHUNK_SIZE = 4 * 1024 * 1024;

export const newFileKey = () =>
  subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);

async function sharedKey(myPrivate: CryptoKey, otherPublicB64: string) {
  const pub = await subtle.importKey("spki", fromB64(otherPublicB64), ECDH, false, []);
  return subtle.deriveKey(
    { name: "ECDH", public: pub },
    myPrivate,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function wrapFileKey(fileKey: CryptoKey, myPrivate: CryptoKey, otherPublicB64: string) {
  const kek = await sharedKey(myPrivate, otherPublicB64);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const raw = await subtle.exportKey("raw", fileKey);
  const ct = await subtle.encrypt({ name: "AES-GCM", iv }, kek, raw);
  return { wrappedKey: toB64(ct), wrapIv: toB64(iv) };
}

export async function unwrapFileKey(
  wrappedKey: string,
  wrapIv: string,
  myPrivate: CryptoKey,
  grantorPublicB64: string,
) {
  const kek = await sharedKey(myPrivate, grantorPublicB64);
  const raw = await subtle.decrypt({ name: "AES-GCM", iv: fromB64(wrapIv) }, kek, fromB64(wrappedKey));
  return subtle.importKey("raw", raw, "AES-GCM", true, ["encrypt", "decrypt"]);
}

const aad = (n: number) => new Uint8Array([(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]);

export async function encryptChunk(key: CryptoKey, n: number, plain: ArrayBuffer) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await subtle.encrypt({ name: "AES-GCM", iv, additionalData: aad(n) }, key, plain);
  const out = new Uint8Array(new ArrayBuffer(12 + ct.byteLength));
  out.set(iv, 0);
  out.set(new Uint8Array(ct), 12);
  return out;
}

export async function decryptChunk(key: CryptoKey, n: number, data: ArrayBuffer) {
  const iv = new Uint8Array(data.slice(0, 12));
  return subtle.decrypt({ name: "AES-GCM", iv, additionalData: aad(n) }, key, data.slice(12));
}