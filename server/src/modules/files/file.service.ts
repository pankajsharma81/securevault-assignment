import { FileRepo } from "./file.repo";
import { Readable } from "stream";
import { AppError } from "../../core/errors/AppError";
import { Storage } from "../../storage/local.storage";
import {
  FILE_MESSAGES,
  CHUNK_OVERHEAD,
} from "../../shared/constants/file.constants";
import { UserRepo } from "../users/user.repo";

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

  listFiles: async (userId: string) => {
    const acls: any[] = await FileRepo.listAclsByUser(userId);
    return acls
      .filter((a) => a.fileId)
      .map((a) => ({
        id: a.fileId._id,
        name: a.fileId.name,
        size: a.fileId.size,
        mimeType: a.fileId.mimeType,
        status: a.fileId.status,
        role: a.role,
        createdAt: a.fileId.createdAt,
      }));
  },

  getFile: async (userId: string, fileId: string) => {
    const file = await FileRepo.findFileById(fileId);
    if (!file) throw new AppError(FILE_MESSAGES.NOT_FOUND, 404);

    const acl: any = await FileRepo.findAclWithGranter(fileId, userId);
    if (!acl) throw new AppError(FILE_MESSAGES.FORBIDDEN, 403);

    return {
      id: file.id,
      name: file.name,
      size: file.size,
      mimeType: file.mimeType,
      chunkSize: file.chunkSize,
      chunkCount: file.chunkCount,
      status: file.status,
      role: acl.role,
      wrappedKey: acl.wrappedKey,
      wrapIv: acl.wrapIv,
      grantedBy: {
        id: acl.grantedBy._id,
        email: acl.grantedBy.email,
        publicKey: acl.grantedBy.publicKey,
      },
    };
  },

  shareFile: async (
    userId: string,
    fileId: string,
    input: { recipientEmail: string; wrappedKey: string; wrapIv: string },
  ) => {
    const file = await FileRepo.findFileById(fileId);
    if (!file) throw new AppError(FILE_MESSAGES.NOT_FOUND, 404);

    const ownerAcl = await FileRepo.findAcl(fileId, userId);
    if (!ownerAcl || ownerAcl.role !== "owner") {
      throw new AppError(FILE_MESSAGES.FORBIDDEN, 403);
    }

    const recipient = await UserRepo.findByEmail(input.recipientEmail);
    if (!recipient) throw new AppError(FILE_MESSAGES.RECIPIENT_NOT_FOUND, 404);
    if (recipient.id === userId)
      throw new AppError(FILE_MESSAGES.CANNOT_SHARE_SELF, 400);

    const existing = await FileRepo.findAcl(fileId, recipient.id);
    if (existing) throw new AppError(FILE_MESSAGES.ALREADY_SHARED, 409);

    await FileRepo.createAcl({
      fileId,
      userId: recipient.id,
      role: "viewer",
      wrappedKey: input.wrappedKey,
      wrapIv: input.wrapIv,
      grantedBy: userId,
    });

    return { fileId, sharedWith: recipient.email, role: "viewer" };
  },
};
