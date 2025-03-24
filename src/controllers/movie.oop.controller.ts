import { PrismaClient } from "@prisma/client";
import { MovieService } from "../services/MovieService";
import { ApiError } from "../middleware/error.middleware";
import { Request, Response, NextFunction } from "express";
import { findFile, resolvePath, scanDirectoryForMovies } from "../utils/scan-functions";
import fs from 'fs';
import path from 'path';
import os from 'os';
import { getDirectoryStats } from "../utils/get-directory-stats";

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

  getAllMovies = async(request: Request, response: Response, next: NextFunction) => {
    try {
      const movies = await this.movieService.getAllMovies();

      if (!movies) {
        return next(new ApiError(404, 'No se encontraron las películas'));
      }

      return response.status(200).json(movies);
    } catch (error) {
      console.error('Error al obtener las películas:', error);
      return next(new ApiError(500, 'Error al obtener las películas'));
    }
  }

  getMoviesByUserId = async(request: Request, response: Response, next: NextFunction) => {
    try {
      const { userId } = request.body;

      const movies = await this.movieService.getMoviesByUserId(userId);

      if (!movies) {
        return next(new ApiError(404, 'No se encontraron las películas del usuario'));
      }

      return response.status(200).json(movies);
    } catch (error) {
      console.error('Error al obtener las películas del usuario:', error);
      return next(new ApiError(500, 'Error al obtener las películas del usuario'));
    }
  }

  updateMovie = async(request: Request, response: Response, next: NextFunction) => {
    try {
      const { title, description, filePath, user, movieId } = request.body;
      const userId = user.userId;

      if (!movieId) {
        return next(new ApiError(400, 'ID de la película no proporcionado'));
      }

      const movie = await this.movieService.updateMovie({
        title,
        description,
        filePath,  
        userId,
      });

      return response.status(200).json(movie);
    } catch (error) {
      console.error('Error al actualizar la película:', error);
      return next(new ApiError(500, 'Error al actualizar la película'));
    }
  }

  deleteMovie = async(request: Request, response: Response, next: NextFunction) => {
    try {
      const { movieId } = request.body;
      const movie = await this.movieService.deleteMovie(movieId);
      if (!movie) {
        return next(new ApiError(404, 'La película no fue encontrada'));
      }
      return response.status(200).json(movie);
    } catch (error) {
      console.error('Error al eliminar la película:', error);
      return next(new ApiError(500, 'Error al eliminar la película'));
    }
  }

  scanDirectoryCtrl = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { directoryPath, user } = request.body;
      const userId = user.userId;

      if (!userId) {
        return next(new ApiError(401, 'Usuario no autenticado'));
      }
  
      if (!directoryPath) {
        return next(new ApiError(400, 'Ruta del directorio no proporcionada'));
      }
  
      const finalDirectoryPath = resolvePath(directoryPath);
  
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

  listHomeFoldersCtrl = async (request: Request, response: Response, next: NextFunction) => {
    try {  
      const homeDir = os.homedir();
      const foldersToFind = ["Downloads", "Videos", "Download", "Video", "Descargas", "Vídeos"];
  
      if (os.platform() === "win32") {
        foldersToFind.push("Mis descargas", "Mis vídeos", "Mis videos");
      }
  
      const foundFolders = [];
  
      for (const folder of foldersToFind) {
        const folderPath = path.join(homeDir, folder);
  
        if (fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory()) {
  
          const stats = getDirectoryStats(folderPath);
          foundFolders.push({
            name: folder,
            path: folderPath,
            stats
          })
        }
      }
  
      if (os.platform() === "win32") {
        const driveLetters = "CDEFGHIJKLMNOPQRSTUVWXYZ";
        for (let i = 0; i < driveLetters.length; i++) {
          const driveLetter = driveLetters[i];
          const drivePath = `${driveLetter}:\\`;
  
          if (fs.existsSync(drivePath)) {
            const commonFolders = ["Movies", "Películas", "Peliculas", "Videos", "Vídeos", "Download", "Downloads", "Video", "Descargas", "Media"];
  
            for (const folder of commonFolders) {
              const folderPath = path.join(drivePath, folder);
              if (fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory()) {
                const stats = getDirectoryStats(folderPath);
  
                foundFolders.push({
                  name: `${driveLetter}:\\${folder}`,
                  path: folderPath,
                  stats
                })
              }
            }
          }
        }
      }
  
      return response.status(200).json({
        message: "Carpetas encontradas en el directorio principal",
        data: {
          homeDir,
          platform: os.platform(),
          folders: foundFolders,
        }
      })
  
    } catch (error) {
      console.error("listHomeFoldersCtrl", error);
      return next(new ApiError(500, 'Error al escanear el directorio'));
    }
  }
}