import { z } from 'zod';
import { MAX_FILE_SIZE } from '../../shared/constants/file.constants';

export const initUploadSchema = z.object({
  name: z.string().min(1).max(255),
  mimeType: z.string().optional(),
  size: z.number().int().positive().max(MAX_FILE_SIZE),
  chunkSize: z.number().int().positive(),
  chunkCount: z.number().int().positive(),
  wrappedKey: z.string().min(1),
  wrapIv: z.string().min(1),
});

export const chunkParamsSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid file id'),
  n: z.coerce.number().int().min(0),
});

export const fileIdParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid file id'),
});

export const shareSchema = z.object({
  recipientEmail: z.string().email(),
  wrappedKey: z.string().min(1),
  wrapIv: z.string().min(1),
});

export const revokeParamsSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid file id'),
  userId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid user id'),
});