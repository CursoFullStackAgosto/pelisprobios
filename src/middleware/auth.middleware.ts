import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from './error.middleware';

const jwtSecret = process.env.JWT_SECRET as string;

export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    next(new ApiError(401, 'Acceso denegado: No se proporcionó token de autenticación'));
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    next(new ApiError(401, 'Acceso denegado: No se proporcionó token de autenticación'));
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.body.user = decoded;
    next();
  } catch (error) {
    next(new ApiError(401, 'Acceso denegado: El token expiro o es inválido'))
    return;
  }
};