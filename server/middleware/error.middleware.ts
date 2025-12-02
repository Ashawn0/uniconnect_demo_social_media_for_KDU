import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log the error
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation error',
      errors: error.errors,
    });
  }

  // Handle known application errors
  if (error.message === 'User with this email already exists') {
    return res.status(409).json({ message: error.message });
  }

  if (error.message === 'Invalid email or password') {
    return res.status(401).json({ message: error.message });
  }

  if (error.message === 'Cannot follow yourself') {
    return res.status(400).json({ message: error.message });
  }

  // Default error response
  const statusCode = (error as any).statusCode || (error as any).status || 500;
  const message = error.message || 'Internal server error';

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
}
