import { AuditLog } from '../../models/audit.model';

export type AuditAction = 'upload' | 'download' | 'share' | 'revoke';

export const AuditRepo = {
  log: (data: {
    fileId: string;
    actorId: string;
    action: AuditAction;
    targetUserId?: string;
    meta?: Record<string, unknown>;
  }) => AuditLog.create(data),

  listByFile: (fileId: string) =>
    AuditLog.find({ fileId })
      .populate('actorId', 'email')
      .populate('targetUserId', 'email')
      .sort({ createdAt: -1 })
      .lean(),
};