import { Schema, model, Types } from 'mongoose';

const auditSchema = new Schema(
  {
    fileId: { type: Types.ObjectId, ref: 'File', required: true, index: true },
    actorId: { type: Types.ObjectId, ref: 'User', required: true },
    action: {
      type: String,
      enum: ['upload', 'download', 'share', 'revoke'],
      required: true,
    },
    targetUserId: { type: Types.ObjectId, ref: 'User' },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const AuditLog = model('AuditLog', auditSchema);