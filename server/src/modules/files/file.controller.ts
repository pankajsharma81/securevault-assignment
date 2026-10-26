import { Response } from 'express';
import { AuthRequest } from '../../types';
import { chunkParamsSchema, fileIdParamSchema, initUploadSchema } from './file.schema';
import { FileService } from './file.service';
import { asyncWrapper } from '../../shared/utils/asyncWrapper';
import { sendSuccess } from '../../shared/utils/apiResponse';
import { FILE_MESSAGES } from '../../shared/constants/file.constants';

export const initUploadHandler = asyncWrapper(async (req: AuthRequest, res: Response) => {
  const body = initUploadSchema.parse(req.body);
  const result = await FileService.initUpload(req.user!.id, body);
  sendSuccess(res, result, FILE_MESSAGES.INIT_OK, 201);
});

export const uploadChunkHandler = asyncWrapper(async (req: AuthRequest, res: Response) => {
  const { id, n } = chunkParamsSchema.parse(req.params);
  const length = Number(req.headers['content-length'] || 0);
  const result = await FileService.uploadChunk(req.user!.id, id, n, req, length);
  sendSuccess(res, result, FILE_MESSAGES.CHUNK_SAVED);
});

export const completeUploadHandler = asyncWrapper(async (req: AuthRequest, res: Response) => {
  const { id } = fileIdParamSchema.parse(req.params);
  const result = await FileService.completeUpload(req.user!.id, id);
  sendSuccess(res, result, FILE_MESSAGES.COMPLETED);
});

export const downloadChunkHandler = asyncWrapper(async (req: AuthRequest, res: Response, next) => {
  const { id, n } = chunkParamsSchema.parse(req.params);
  const stream = await FileService.downloadChunk(req.user!.id, id, n);
  res.setHeader('Content-Type', 'application/octet-stream');
  stream.on('error', next);
  stream.pipe(res);
});