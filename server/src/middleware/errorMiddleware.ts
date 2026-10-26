import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../core/errors/AppError';

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({ success: false, message: 'Validation error', error: err.issues });
    return;
  }
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ success: false, message: 'Internal server error' });
};