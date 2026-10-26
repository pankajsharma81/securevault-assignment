import { Router } from 'express';
import userRoutes from '../modules/users/user.routes';
import fileRoutes from '../modules/files/file.routes';
import auditRoutes from '../modules/audit/audit.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'OK' });
});

router.use('/', userRoutes);
router.use('/files', fileRoutes);
router.use('/audit', auditRoutes);

export default router;