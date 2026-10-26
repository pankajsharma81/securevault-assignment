import { Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../../types";
import { asyncWrapper } from "../../shared/utils/asyncWrapper";
import { sendSuccess } from "../../shared/utils/apiResponse";
import { AuditService } from "./audit.service";

const paramsSchema = z.object({
  fileId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid file id"),
});

export const listAuditHandler = asyncWrapper(
  async (req: AuthRequest, res: Response) => {
    const { fileId } = paramsSchema.parse(req.params);
    const logs = await AuditService.listForFile(req.user!.id, fileId);
    sendSuccess(res, logs, "Audit log fetched");
  },
);