import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET as string;

export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ message: "Acceso denegado" });
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "Acceso denegado" });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.body.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Acceso denegado" });
    return;
  }
};