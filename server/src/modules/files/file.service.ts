import { FileRepo } from "./file.repo";
import { Readable } from "stream";
import { AppError } from "../../core/errors/AppError";
import { Storage } from "../../storage/local.storage";
import {
  FILE_MESSAGES,
  CHUNK_OVERHEAD,
} from "../../shared/constants/file.constants";

interface InitInput {
  name: string;
  mimeType?: string;
  size: number;
  chunkSize: number;
  chunkCount: number;
  wrappedKey: string;
  wrapIv: string;
}

export const FileService = {
  initUpload: async (userId: string, input: InitInput) => {
    const file = await FileRepo.createFile({
      ownerId: userId,
      name: input.name,
      mimeType: input.mimeType,
      size: input.size,
      chunkSize: input.chunkSize,
      chunkCount: input.chunkCount,
    });

    await FileRepo.createAcl({
      fileId: file.id,
      userId,
      role: "owner",
      wrappedKey: input.wrappedKey,
      wrapIv: input.wrapIv,
      grantedBy: userId,
    });

    return { fileId: file.id };
  },

  uploadChunk: async (
    userId: string,
    fileId: string,
    n: number,
    stream: Readable,
    contentLength: number,
  ) => {
    const file = await FileRepo.findFileById(fileId);
    if (!file) throw new AppError(FILE_MESSAGES.NOT_FOUND, 404);

    const acl = await FileRepo.findAcl(fileId, userId);
    if (!acl || acl.role !== "owner")
      throw new AppError(FILE_MESSAGES.FORBIDDEN, 403);

    if (file.status !== "uploading")
      throw new AppError("Upload already completed", 409);
    if (n >= file.chunkCount) throw new AppError("Invalid chunk number", 400);
    if (contentLength <= 0) throw new AppError("Empty chunk", 400);
    if (contentLength > file.chunkSize + CHUNK_OVERHEAD) {
      throw new AppError("Chunk too large", 413);
    }

    await Storage.saveChunk(fileId, n, stream);
    return { chunk: n };
  },

  completeUpload: async (userId: string, fileId: string) => {
    const file = await FileRepo.findFileById(fileId);
    if (!file) throw new AppError(FILE_MESSAGES.NOT_FOUND, 404);

    const acl = await FileRepo.findAcl(fileId, userId);
    if (!acl || acl.role !== "owner")
      throw new AppError(FILE_MESSAGES.FORBIDDEN, 403);

    for (let i = 0; i < file.chunkCount; i++) {
      if (!Storage.chunkExists(fileId, i)) {
        throw new AppError(`Chunk ${i} is missing`, 400);
      }
    }

    await FileRepo.markComplete(fileId);
    return { fileId, status: "complete" };
  },

  downloadChunk: async (userId: string, fileId: string, n: number) => {
    const file = await FileRepo.findFileById(fileId);
    if (!file) throw new AppError(FILE_MESSAGES.NOT_FOUND, 404);

    const acl = await FileRepo.findAcl(fileId, userId);
    if (!acl) throw new AppError(FILE_MESSAGES.FORBIDDEN, 403);

    if (file.status !== "complete")
      throw new AppError(FILE_MESSAGES.NOT_COMPLETE, 409);
    if (n >= file.chunkCount) throw new AppError("Invalid chunk number", 400);

    return Storage.readChunk(fileId, n);
  },
};
