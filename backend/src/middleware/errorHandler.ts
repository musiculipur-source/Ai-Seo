import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(`[Error Handler] Path: ${req.path} | Error:`, err);
  
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    error: {
      message: err.message || 'An unexpected error occurred during the SEO audit pipeline.',
      status: statusCode,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });
}
