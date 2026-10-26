export const FILE_MESSAGES = {
  INIT_OK: "Upload initialised",
  NOT_FOUND: "File not found",
  FORBIDDEN: "Access denied",
  CHUNK_SAVED: "Chunk saved",
  COMPLETED: "Upload completed",
  NOT_COMPLETE: "File upload not completed",
} as const;

export const MAX_FILE_SIZE = 1024 * 1024 * 1024 + 64 * 1024 * 1024;
export const CHUNK_OVERHEAD = 64;
