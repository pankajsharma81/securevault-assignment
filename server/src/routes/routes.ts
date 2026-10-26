import { Router } from 'express';
import userRoutes from '../modules/users/user.routes';
import fileRoutes from '../modules/files/file.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'OK' });
});

router.use('/', userRoutes);
router.use('/files', fileRoutes);

export default router;