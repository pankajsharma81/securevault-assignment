import { Schema, model, Types } from 'mongoose';

const aclSchema = new Schema(
  {
    fileId: { type: Types.ObjectId, ref: 'File', required: true },
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['owner', 'viewer'], required: true },
    wrappedKey: { type: String, required: true },
    wrapIv: { type: String, required: true },
    grantedBy: { type: Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

aclSchema.index({ fileId: 1, userId: 1 }, { unique: true });

export const Acl = model('Acl', aclSchema);