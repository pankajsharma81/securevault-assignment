export const FILE_MESSAGES = {
  INIT_OK: "Upload initialised",
  NOT_FOUND: "File not found",
  FORBIDDEN: "Access denied",
  CHUNK_SAVED: "Chunk saved",
  COMPLETED: "Upload completed",
  NOT_COMPLETE: "File upload not completed",
  LISTED: "Files fetched",
  FETCHED: "File fetched",
  SHARED: "File shared",
  ALREADY_SHARED: "Already shared with this user",
  RECIPIENT_NOT_FOUND: "Recipient not found",
  CANNOT_SHARE_SELF: "Cannot share with yourself",
  ACL_LISTED: "Access list fetched",
  REVOKED: "Access revoked",
  CANNOT_REVOKE_OWNER: "Owner access cannot be revoked",
  ACL_NOT_FOUND: "User does not have access to this file",
} as const;

export const MAX_FILE_SIZE = 1024 * 1024 * 1024 + 64 * 1024 * 1024;
export const CHUNK_OVERHEAD = 64;
