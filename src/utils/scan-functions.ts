import fs from 'fs';
import path from 'path';
import { MovieWithDetails } from '../entities/global.entities';
import { VIDEO_EXTENSIONS } from '../constants/global.constants';
import { fetchMovieDetails } from '../services/fetch-imdb';
import { PrismaClient } from '@prisma/client';
import { MovieService } from '../services/MovieService';
import { ApiError } from '../middleware/error.middleware';

export const findFile = (filePath: string): boolean => {
  return fs.existsSync(filePath);
}

export const resolvePath = (inputPath: string) => {
  if (path.isAbsolute(inputPath)) {
    return inputPath;
  }

  return path.resolve(process.cwd(), inputPath);
}

export const scanDirectoryForMovies = async(directoryPath: string, userId: number): Promise<any> => {
  const prisma = new PrismaClient();
  const foundMovies: MovieWithDetails[] = [];
  const movieService = new MovieService(prisma);
  console.log('directoryPathFromScanFn', directoryPath);
  const processItem = async(itemPath: string): Promise<void> =>{
    try {
      const stats = fs.statSync(itemPath);
      if (stats.isDirectory()) {
        const items = fs.readdirSync(itemPath);
        for (const item of items) {
          await processItem(path.join(itemPath, item));
        }
      } else if (stats.isFile()) {
        const ext = path.extname(itemPath).toLowerCase();
        if (VIDEO_EXTENSIONS.includes(ext)) {
          const title = path.basename(itemPath, ext);

          const existingMovie = await movieService.getMovieByFilePath({
            userId,
            filePath: itemPath
          })

          console.log('existingMovie', existingMovie);

          if (!existingMovie) {
            try {
              const movieDetails = await fetchMovieDetails(title);

              const movie = await movieService.createMovie({
                  title: movieDetails?.Title ?? title,
                  filePath: itemPath,
                  userId,
                  description: movieDetails?.Plot ?? 'No se encontró descripción'
                }
              )
              
              foundMovies.push({
                id: movie.id,
                title: movie.title,
                description: movie.description,
                filePath: movie.filePath,
                userId: movie.userId,
                createdAt: movie.createdAt,
                updatedAt: movie.updatedAt,
                additionalDetails: movieDetails
              })

            } catch (error) {
              console.error(`Error al procesar la película ${title}:`, error);

              const movie = await movieService.createMovie({
                title,
                filePath: itemPath,
                userId,
              }
            )

              foundMovies.push(movie);
            }
          }
          return;
        }
      }
    } catch (error) {
      throw new ApiError(500, 'Error al procesar el directorio');
    }
  }

  await processItem(directoryPath);
  return foundMovies;
}
