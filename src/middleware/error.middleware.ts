import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";

export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true, stack = '' ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

export const errorConverter = (err: any, request: Request, response: Response, next: NextFunction) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || error instanceof SyntaxError ? 400 : 500;
    const message = error.message || 'Error interno del servidor';
    error = new ApiError(statusCode, message, false, error.stack);
  }

  next(error);
}

export const errorHandler = (err: ApiError, request: Request, response: Response, next: NextFunction) => {
  const { statusCode, message, stack } = err;

  const responseBody = {
    status: 'error',
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: stack })
  };

  if (statusCode >= 500) {
    logger.error(`${statusCode} - ${message} - ${request.originalUrl} - ${request.method} - ${request.ip}`);
    logger.error(stack ?? 'No hay stack disponible');
  } else {
    logger.warn(`${statusCode} - ${message} - ${request.originalUrl} - ${request.method} - ${request.ip}`);
  }

  response.status(statusCode).json(responseBody);
}

export const notFoundHandler = (request: Request, response: Response, next: NextFunction) => {
  const error = new ApiError(404, `Recurso no encontrado ${request.originalUrl}`);
  next(error);
}