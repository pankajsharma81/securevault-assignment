# SecureVault

Zero-knowledge encrypted file sharing. Files are encrypted in the browser; the server only stores ciphertext and wrapped keys, so even an administrator cannot read file contents.

**Stack:** React + Vite (client), Node/Express + TypeScript (API), MongoDB/Mongoose, Docker. Storage is local disk (`StorageDir`), behind a small storage module so S3 can replace it.

## Run

```bash
cd server && docker compose up --build -d   # MongoDB + API on :4000
cd client && npm install && npm run dev      # UI on :5173
```

`client/.env`: `VITE_API_URL=http://localhost:4000/v1`

## Security design

**Keys from password (browser only).** PBKDF2-SHA256 (600,000 iterations) derives 512 bits from the password. The first 256 bits are the `authKey` (sent to the server for login, bcrypt-hashed there). The last 256 bits are an AES-GCM wrap key that never leaves the browser. The server therefore cannot derive the wrap key from anything it stores.

**Identity.** Each user gets an ECDH P-256 key pair at registration. The private key is encrypted with the wrap key (AES-GCM) and stored as `encryptedPrivateKey`. The public key is stored in clear.

**File encryption.** A random AES-256-GCM key is generated per file. The file is split into 4 MB chunks in the browser; each chunk is encrypted with a fresh random 12-byte IV, and the chunk index is bound as AAD, so chunks cannot be reordered or swapped without detection. IV is prepended to each chunk.

**Key sharing (ECDH).** The file key is wrapped with an AES-GCM key derived by ECDH between the grantor's private key and the recipient's public key. The server stores only `wrappedKey` + `wrapIv` per (file, user) in the ACL. The server never sees a raw file key or private key.

**Access control.** JWT (1 day) on every `/files` and `/audit` route. Roles `owner` and `viewer` are stored in the `acls` collection (unique per file+user). Chunk download requires an ACL entry; only the owner can upload chunks, share, revoke, list ACL, or read the audit log. Unauthorized requests get 401/403 before any chunk is read from disk.

**Audit.** `upload`, `download`, `share`, `revoke` events are logged per file and exposed at `GET /v1/audit/:fileId` (owner only).

## API

| Method | Path | Purpose |
|---|---|---|
| POST | /v1/auth/register | create user + key material |
| POST | /v1/auth/login | JWT + encrypted private key |
| GET | /v1/users/:email/public-key | recipient public key |
| POST | /v1/files/init | create file + owner ACL |
| PUT | /v1/files/:id/chunks/:n | upload encrypted chunk (owner) |
| POST | /v1/files/:id/complete | verify all chunks, mark complete |
| GET | /v1/files | files I own or that are shared with me |
| GET | /v1/files/:id | metadata + my wrapped key |
| GET | /v1/files/:id/chunks/:n | download encrypted chunk (ACL) |
| POST | /v1/files/:id/share | share with a user (owner) |
| GET | /v1/files/:id/acl | list access (owner) |
| DELETE | /v1/files/:id/share/:userId | revoke access (owner) |
| GET | /v1/audit/:fileId | audit trail (owner) |

## Revocation

Revoking deletes the recipient's ACL entry (and their wrapped key), so the server immediately refuses to serve chunks and metadata to them. **Limitation:** a user who already downloaded and unwrapped the file key can still decrypt any ciphertext copy they saved. Full cryptographic revocation requires re-encrypting the file with a new key and re-wrapping it for remaining users (key rotation). This is not implemented; it is the main known gap.

## Scale

- Chunks are streamed to disk and are never buffered whole on the server.
- Metadata (MongoDB) and blobs (disk, swappable to S3 multipart) are separate.
- Sharding design: shard `files` and `audit_logs` by `ownerId`/`fileId` (hashed), and `acls` by `userId`, so a user's listing hits one shard. Not deployed in this submission (single-node Mongo).

## Performance

| Test | Result |
|---|---|
| Upload 1 GB (encrypt + chunked upload) | [__ min __ s] |
| Download + decrypt 1 GB | [__ min __ s] |
| Machine / browser | [e.g. laptop, Chrome] |

Download currently collects decrypted chunks in browser memory before saving, so very large files use a lot of RAM.

## Not implemented / known limitations

- Key rotation on revoke (see above); MFA; homomorphic encrypted search (bonus items).
- S3 storage (local disk used instead).
- No automated tests.
- The KDF salt is derived from the email (client-side, deterministic); a random per-user salt would be stronger.
- Production use needs HTTPS and rate limiting on login.