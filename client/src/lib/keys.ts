import { toB64, fromB64 } from "./b64";

const enc = new TextEncoder();
const subtle = crypto.subtle;

export const saltFor = (email: string): Uint8Array<ArrayBuffer> => {
  const bytes = enc.encode("securevault:" + email.trim().toLowerCase());
  const out = new Uint8Array(new ArrayBuffer(bytes.length));
  out.set(bytes);
  return out;
};

export async function deriveKeys(email: string, password: string) {
  const pw = enc.encode(password);
  const pwBuf = new Uint8Array(new ArrayBuffer(pw.length));
  pwBuf.set(pw);

  const base = await subtle.importKey("raw", pwBuf, "PBKDF2", false, ["deriveBits"]);
  const bits = new Uint8Array(
    await subtle.deriveBits(
      { name: "PBKDF2", hash: "SHA-256", salt: saltFor(email), iterations: 600_000 },
      base,
      512,
    ),
  );
  const authKey = toB64(bits.slice(0, 32));
  const wrapKey = await subtle.importKey("raw", bits.slice(32), "AES-GCM", false, ["encrypt", "decrypt"]);
  return { authKey, wrapKey };
}


export async function createIdentity(email: string, password: string) {
  const { authKey, wrapKey } = await deriveKeys(email, password);

  const pair = await subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveKey", "deriveBits"]);
  const publicKey = toB64(await subtle.exportKey("spki", pair.publicKey));
  const pkcs8 = await subtle.exportKey("pkcs8", pair.privateKey);

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await subtle.encrypt({ name: "AES-GCM", iv }, wrapKey, pkcs8);

  return {
    email,
    authKey,
    publicKey,
    encryptedPrivateKey: toB64(encrypted),
    kdfSalt: toB64(saltFor(email)),
    privateKeyIv: toB64(iv),
  };
}

export async function unlockPrivateKey(
  wrapKey: CryptoKey,
  encryptedPrivateKey: string,
  privateKeyIv: string,
): Promise<CryptoKey> {
  const pkcs8 = await subtle.decrypt(
    { name: "AES-GCM", iv: fromB64(privateKeyIv) },
    wrapKey,
    fromB64(encryptedPrivateKey),
  );
  return subtle.importKey("pkcs8", pkcs8, { name: "ECDH", namedCurve: "P-256" }, false, ["deriveKey", "deriveBits"]);
}