import { Request, Response } from "express";
import fs from "fs";
import path = require("path");
import { Movie, PrismaClient } from "@prisma/client";
import os from "os";
import { getDirectoryStats } from "../utils/get-directory-stats";
import { VIDEO_EXTENSIONS } from "../constants/global.constants";
import { fetchMovieDetails } from "../services/fetch-imdb";
import { MovieDetails } from "../entities/global.entities";

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

const resolvePath = (inputPath: string) => {
  if (path.isAbsolute(inputPath)) {
    return inputPath;
  }

  return path.resolve(process.cwd(), inputPath);
}

interface MovieWithDetails extends Movie {
  additionalDetails?: MovieDetails | null;
}

const scanDirectoryForMovies = async(directoryPath: string, userId: number): Promise<any> => {
  const foundMovies: MovieWithDetails[] = [];

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

          const existingMovie = await prisma.movie.findFirst({
            where: {
              userId,
              filePath: itemPath
            }
          })

          if (!existingMovie) {
            try {
              const movieDetails = await fetchMovieDetails(title);

              const movie = await prisma.movie.create({
                data: {
                  title: movieDetails?.Title ?? title,
                  filePath: itemPath,
                  userId,
                  description: movieDetails?.Plot ?? 'No se encontró descripción'
                }
              })

              foundMovies.push({
                ...movie,
                additionalDetails: movieDetails
              })

            } catch (error) {
              console.error(`Error al procesar la película ${title}:`, error);

              const movie = await prisma.movie.create({
                data: {
                  title,
                  filePath: itemPath,
                  userId,
                }
              })

              foundMovies.push(movie);
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error al procesar el directorio ${directoryPath}:`, error);
    }
  }

  await processItem(directoryPath);
  return foundMovies;
}


export const scanDirectoryCtrl = async (request: Request, response: Response) => {
  try {
    const { directoryPath } = request.body;

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

    const finalDirectoryPath = resolvePath(directoryPath);

    if (!findFile(finalDirectoryPath)) {
      return response.status(404).json({
        message: "Directorio no encontrado",
      });
    }

    const stats = fs.statSync(finalDirectoryPath);

    if (!stats.isDirectory()) {
      return response.status(400).json({
        message: "La ruta proporcionada no es un directorio válido",
      });
    }

    const resultScan = await scanDirectoryForMovies(finalDirectoryPath, userId);

    return response.status(200).json({
      message: "Directorio escaneado correctamente",
      data: {
        directoryPath: finalDirectoryPath,
        resultScan
      }
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

export const getMovieCtrl = async (request: AuthenticatedRequest, response: Response) => {
  const { movieId } = request.params;
  const userId = request.body.user?.userId;
  if (!userId) {
    return response.status(401).json({
      message: "Usuario no autenticado",
    });
  }
  if(!movieId) {
    return response.status(400).json({
      message: "ID de película no proporcionado",
    });
  }
  const movie = await prisma.movie.findFirst({
    where: {
      id: parseInt(movieId),
      userId
    },
    select: {
      id: true,
      title: true,
      description: true,
      filePath: true
    }
  })
  if(!movie) {
    return response.status(404).json({
      message: "Película no encontrada",
    })
  }
  return response.status(200).json({
    message: "Película encontrada",
    data: movie
  })
}

export const updateMovieCtrl = async (request: AuthenticatedRequest, response: Response) => {
  const { movieId } = request.params;
  const userId = request.body.user?.userId;
  const { title, description, filePath } = request.body;
  if (!userId) {
    return response.status(401).json({
      message: "Usuario no autenticado",
    });
  }
  if(!movieId) {
    return response.status(400).json({
      message: "ID de película no proporcionado",
    });
  }
  const existingMovie = await prisma.movie.findFirst({
    where: {
      id: parseInt(movieId),
      userId
    },
    select: {
      id: true,
      title: true,
      description: true,
      filePath: true
    }
  })
  if(!existingMovie){
    return response.status(404).json({
      message: "Película no encontrada",
    })
  }
const updatedMovie = await prisma.movie.update({
  where: {
    id: parseInt(movieId),
    userId,
  },
  data: {
    title: title ?? existingMovie.title,
    description: description ?? existingMovie.description,
    filePath: filePath ?? existingMovie.filePath
  }
})

return response.status(200).json({
  message: "Pelicula actualizada correctamente",
  data: {
    updatedMovie
  }
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

export const listHomeFoldersCtrl = async (request: AuthenticatedRequest, response: Response) => {
  try {
    const userId = request.body.user?.userId;

    if (!userId) {
      return response.status(401).json({
        message: "Usuario no autenticado",
      })
    }

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
    return response.status(500).json({
      message: "Error al listar las carpetas",
    })

  }

}