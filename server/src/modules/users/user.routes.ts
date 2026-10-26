import { Router } from 'express';
import { registerHandler, loginHandler, getPublicKeyHandler } from './user.controller';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = Router();

router.post('/auth/register', registerHandler);
router.post('/auth/login', loginHandler);
router.get('/users/:email/public-key', authMiddleware, getPublicKeyHandler);

export default router;