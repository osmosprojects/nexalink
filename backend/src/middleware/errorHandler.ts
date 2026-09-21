import { Request, Response, NextFunction } from 'express';
import { sendError } from '../helpers/response';
import { ZodError } from 'zod';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(`[API Error] ${req.method} ${req.originalUrl}:`, err);

  if (err instanceof ZodError) {
    const errorDetails = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, 'Validation failed for request data', 422, 'VALIDATION_ERROR', errorDetails);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error occurred';
  const code = err.code || 'SERVER_ERROR';

  return sendError(res, message, statusCode, code);
}
