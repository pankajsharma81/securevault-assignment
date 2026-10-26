import { Schema, model, Types } from 'mongoose';

const fileSchema = new Schema(
  {
    ownerId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    mimeType: { type: String, default: 'application/octet-stream' },
    size: { type: Number, required: true },
    chunkSize: { type: Number, required: true },
    chunkCount: { type: Number, required: true },
    status: { type: String, enum: ['uploading', 'complete'], default: 'uploading' },
  },
  { timestamps: true },
);

export const File = model('File', fileSchema);