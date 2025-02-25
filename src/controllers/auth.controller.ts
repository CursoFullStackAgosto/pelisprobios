import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const registerCtrl = async (request: Request, response: Response) => {
  const { username, email, password, age } = request.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        age
      }
    })

    return response.status(201).json({
      user,
      message: 'Usuario registrado correctamente'
    })

  } catch (error) {
    console.error(error)
    return response.status(500).json({
      message: 'Error al registrar el usuario'
    })
  }
}
