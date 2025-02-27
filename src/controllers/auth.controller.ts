import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const prisma = new PrismaClient();
const jwtSecret = process.env.JWT_SECRET as string;
export const registerCtrl = async (request: Request, response: Response) => {
  const { username, email, password, age } = request.body;

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
    console.error(error);
    return response.status(500).json({
      message: "Error al registrar el usuario",
    });
  }
};

export const loginCtrl = async (request: Request, response: Response) => {
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
    const token = jwt.sign({userId: id, email},jwtSecret, {
      expiresIn: '1h'
    });
    return response.status(200).json({
      token,
      message: "Inicio de sesión correcto",
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      message: "Error al iniciar sesión",
    });
  }
};
