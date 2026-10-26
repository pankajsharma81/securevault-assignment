import { Router } from 'express';
import userRoutes from '../modules/users/user.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'OK' });
});

router.use('/', userRoutes);
export default router;