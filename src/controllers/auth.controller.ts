import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ApiError } from '../middleware/error.middleware';
import speakeasy from 'speakeasy';

const prisma = new PrismaClient();
const jwtSecret = process.env.JWT_SECRET as string;

export const registerCtrl = async (request: Request, response: Response, next: NextFunction) => {
  const { username, email, password, age } = request.body;
  const userEmailExists = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (userEmailExists) {
    return response.status(409).json({
      message: "El correo electrónico ya está en uso",
    });
  }
  const userUsernameExists = await prisma.user.findUnique({
    where: {
      username,
    },
  });
  if (userUsernameExists) {
    return response.status(409).json({
      message: "El nombre de usuario ya está en uso",
    });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        age: parseInt(age),
      },
    });

    return response.status(201).json({
      user,
      message: "Usuario registrado correctamente",
    });
  } catch (error) {
    next(new ApiError(500, 'Error al registrar el usuario'))
  }
};

export const loginCtrl = async (request: Request, response: Response, next: NextFunction) => {
  const { email, password } = request.body;
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if(!user) {
      return response.status(404).json({
        message: "Usuario o contraseña incorrectos",
      });
    }
    const  { password : hashedPassword, id } = user;
    const isPasswordValid = await bcrypt.compare(password, hashedPassword);
    if(!isPasswordValid) {
      return response.status(404).json({
        message: "Usuario o contraseña incorrectos",
      });
    }
    const token = jwt.sign({
      userId: id,
      email
    },jwtSecret, {
      expiresIn: '1h'
    });
    return response.status(200).json({
      token,
      message: "Inicio de sesión correcto",
    });
  } catch (error) {
    next(new ApiError(500, 'Error al iniciar sesión'));
  }
};

export const setupTwoFactorAuthCtrl = async(request: Request, response: Response, next: NextFunction) => {
  try {
    const user = request.body.user;
    if (!user || !user.userId) {
      return response.status(401).json({
        message: "Usuario no autenticado",
      })
    }

    const userId = user.userId;
    const { token } = request.body;

    const userDetails = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!userDetails) {
      return response.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    if (userDetails.twoFactorEnabled && userDetails.twoFactorSecret) {
      return response.status(400).json({
        message: "La autenticación de dos factores ya está configurada",
      });
    }


    const secret = speakeasy.generateSecret({
      name: `PelisProBios:${userDetails.email}`
    });

    await prisma.user.update({
      where: { id: userId},
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: secret.base32
      }
    })

    return response.status(201).json({
      message: "Configuración de autenticación de dos factores iniciada",
      secret: secret.base32,
    })
  } catch (error) {
    next(new ApiError(500, 'Error al configurar la autenticación de dos factores'))
  }
}
