import { Request, Response } from "express";
import fs from "fs";
import path = require("path");
import { PrismaClient } from "@prisma/client";
const basePath = path.join(__dirname,"..","..","movies");
interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
  }
}

const prisma = new PrismaClient();

const findFile = (filePath: string): boolean => {
  return fs.existsSync(filePath);
}

export const scanDirectoryCtrl = async (request: AuthenticatedRequest, response: Response) => {
  try {
    const { directoryPath } = request.body;
    const finalDirectoryPath = '/home/majomaken/develop/companies/bios/l7-group/learning/pelisprobios' + directoryPath;
    const userId  = request.body.user?.userId;

    if (!userId) {
      return response.status(401).json({
        message: "Usuario no autenticado",
      });
    }

    if (!directoryPath) {
      return response.status(400).json({
        message: "Ruta del directorio no proporcionada",
      });
    }

    if (!findFile(finalDirectoryPath)) {
      return response.status(404).json({
        message: "Directorio no encontrado",
      });
    }
    return response.status(200).json({
      message: "Directorio escaneado correctamente",
    });

  } catch (error) {
    console.error(error);
    return response.status(500).json({
      message: "Error al escanear el directorio",
    });
  }
}

export const crateMovieCtrl = async (request: AuthenticatedRequest, response: Response) => {

    const { title, description, filePath} = request.body;
    const userId = request.body.user?.userId;
    if (!userId) {
      return response.status(401).json({
        message: "Usuario no autenticado",
      });
    }
    const finalFilePath = `${basePath}/${filePath}`;
    const file = findFile(finalFilePath);
    if(!file) {
      return response.status(404).json({
        message: "Archivo no encontrado",
      });
    }
try {
    const movie = await prisma.movie.create({
      data: {
        title,
        description,
        filePath: finalFilePath,
        userId,
      },
    });

    return response.status(201).json({
      message: "Película creada correctamente",
      data: movie,
    });
  } catch (error) {
    return response.status(500).json({
      message: "Error al crear la película",
    });
  }
}

export const getMoviesCtrl = async (request: AuthenticatedRequest, response: Response) => {
  const userId = request.body.user?.userId;
  if (!userId) {
    return response.status(401).json({
      message: "Usuario no autenticado",
    });
  }
  const movies = await prisma.movie.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      title: true,
      description: true,
      filePath: true
    }
  })
  if(!movies) {
    return response.status(404).json({
      message: "No se encontraron películas",
    });
  }

  return response.status(200).json({
    message: "Películas encontradas",
    data: movies
  })
}


export const deleteMovieCtrl = async (request: AuthenticatedRequest, response: Response) => {
  const { movieId } = request.params;
  const userId = request.body.user?.userId;
  if (!userId) {
    return response.status(401).json({
      message: "Usuario no autenticado",
    });
  }

  const movie = await prisma.movie.delete({
    where: {
      id: parseInt(movieId),
    },
  });
  if(!movie) {
    return response.status(404).json({
      message: "Película no encontrada",
    });
  }
  return response.status(200).json({
    message: "Película eliminada correctamente",
  });
}