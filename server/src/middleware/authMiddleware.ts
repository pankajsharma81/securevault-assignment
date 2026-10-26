import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../core/errors/AppError';
import { AuthRequest } from '../types';

export const authMiddleware = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError('Authorization header missing', 401));
  }

  try {
    const decoded = jwt.verify(header.substring(7), env.JWT_SECRET) as {
      id: string;
      email: string;
    };
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
};