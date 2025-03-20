import { PrismaClient } from "@prisma/client";
import { MovieService } from "../services/MovieService";
import { ApiError } from "../middleware/error.middleware";
import { Request, Response, NextFunction } from "express";
import { findFile, resolvePath, scanDirectoryForMovies } from "../utils/scan-functions";
import fs from 'fs';

export class MovieController {
  private movieService: MovieService;
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
    this.movieService = new MovieService(this.prisma);
  }

  createMovie = async(request: Request, response: Response, next: NextFunction) => {
    try {
      const { title, description, filePath, user } = request.body;

      const userId = user.userId;

      const movie = await this.movieService.createMovie({
        title,
        description,
        filePath,
        userId,
      });

      return response.status(201).json(movie);
    } catch (error) {
      console.error('Error al crear la película:', error);
      return next(new ApiError(500, 'Error al crear la película'));
    }
  }

  scanDirectoryCtrl = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { directoryPath, user } = request.body;

      console.log('directoryPath', directoryPath);
  
      const userId = user.userId;

      console.log('userId', userId);
  
      if (!userId) {
        return next(new ApiError(401, 'Usuario no autenticado'));
      }
  
      if (!directoryPath) {
        return next(new ApiError(400, 'Ruta del directorio no proporcionada'));
      }
  
      const finalDirectoryPath = resolvePath(directoryPath);

      console.log('finalDirectoryPath', finalDirectoryPath);
  
      if (!findFile(finalDirectoryPath)) {
        return next(new ApiError(404, 'Directorio no encontrado'));
      }
  
      const stats = fs.statSync(finalDirectoryPath);
  
      if (!stats.isDirectory()) {
        return next(new ApiError(400, 'La ruta proporcionada no es un directorio válido'));
      }
  
      const resultScan = await scanDirectoryForMovies(finalDirectoryPath, userId);
      
      const result = {
        message: "Directorio escaneado correctamente",
        data: {
          directoryPath: finalDirectoryPath,
          resultScan
        }
      }
  
      return response.status(200).json(result);
  
    } catch (error) {
      return next(new ApiError(500, 'Error al escanear el directorio'));
    }
  }
}