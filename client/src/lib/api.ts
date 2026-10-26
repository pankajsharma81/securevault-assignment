const BASE = import.meta.env.VITE_API_URL as string;

let token: string | null = null;
export const setToken = (t: string | null) => (token = t);

export async function api<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && typeof init.body === "string") headers.set("Content-Type", "application/json");

  const res = await fetch(BASE + path, { ...init, headers });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message ?? `Request failed (${res.status})`);
  return json.data as T;
}

export const post = <T = any>(path: string, body: unknown) =>
  api<T>(path, { method: "POST", body: JSON.stringify(body) });

export async function putBinary(path: string, body: Uint8Array<ArrayBuffer>) {
  const headers = new Headers({ "Content-Type": "application/octet-stream" });
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(BASE + path, { method: "PUT", headers, body });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message ?? `Upload failed (${res.status})`);
}

export async function getBinary(path: string): Promise<ArrayBuffer> {
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(BASE + path, { headers });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.message ?? `Download failed (${res.status})`);
  }
  return res.arrayBuffer();
}