import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { completeUploadHandler, downloadChunkHandler, getFileHandler, initUploadHandler, listAclHandler, listFilesHandler, revokeShareHandler, shareFileHandler, uploadChunkHandler } from './file.controller';

const router = Router();

router.use(authMiddleware);

router.post('/init', initUploadHandler);
router.put('/:id/chunks/:n', uploadChunkHandler);
router.post('/:id/complete', completeUploadHandler);
router.get('/:id/chunks/:n', downloadChunkHandler);
router.get('/', listFilesHandler);
router.get('/:id', getFileHandler);
router.post('/:id/share', shareFileHandler);
router.get('/:id/acl', listAclHandler);
router.delete('/:id/share/:userId', revokeShareHandler);

export default router;