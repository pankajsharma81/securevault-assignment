import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { completeUploadHandler, downloadChunkHandler, getFileHandler, initUploadHandler, listFilesHandler, shareFileHandler, uploadChunkHandler } from './file.controller';

const router = Router();

router.use(authMiddleware);

router.post('/init', initUploadHandler);
router.put('/:id/chunks/:n', uploadChunkHandler);
router.post('/:id/complete', completeUploadHandler);
router.get('/:id/chunks/:n', downloadChunkHandler);
router.get('/', listFilesHandler);
router.get('/:id', getFileHandler);
router.post('/:id/share', shareFileHandler);

export default router;