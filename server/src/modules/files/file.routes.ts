import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { completeUploadHandler, downloadChunkHandler, initUploadHandler, uploadChunkHandler } from './file.controller';

const router = Router();

router.use(authMiddleware);

router.post('/init', initUploadHandler);
router.put('/:id/chunks/:n', uploadChunkHandler);
router.post('/:id/complete', completeUploadHandler);
router.get('/:id/chunks/:n', downloadChunkHandler);

export default router;