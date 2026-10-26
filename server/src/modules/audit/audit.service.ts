import { AuditRepo } from "./audit.repo";
import { FileRepo } from "../files/file.repo";
import { AppError } from "../../core/errors/AppError";
import { FILE_MESSAGES } from "../../shared/constants/file.constants";

export const AuditService = {
  listForFile: async (userId: string, fileId: string) => {
    const file = await FileRepo.findFileById(fileId);
    if (!file) throw new AppError(FILE_MESSAGES.NOT_FOUND, 404);

    const acl = await FileRepo.findAcl(fileId, userId);
    if (!acl || acl.role !== "owner")
      throw new AppError(FILE_MESSAGES.FORBIDDEN, 403);

    const logs: any[] = await AuditRepo.listByFile(fileId);
    return logs.map((l) => ({
      id: l._id,
      action: l.action,
      actor: l.actorId?.email ?? null,
      target: l.targetUserId?.email ?? null,
      at: l.createdAt,
    }));
  },
};