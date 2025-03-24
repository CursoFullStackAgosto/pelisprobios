import { PrismaClient } from "@prisma/client";
import { Movie } from "../models/Movie";

export class MovieService {
  private readonly prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  /**
   * Método para crear una nueva película
   * @param data Datos de la película
   * @returns Instancia de Movie
   */
  async createMovie(data: {
    title: string;
    description?: string | null;
    filePath: string;
    userId: number;
  }): Promise<Movie> {
    const movie = await this.prisma.movie.create({
      data: {
        title: data.title,
        description: data.description,
        filePath: data.filePath,
        userId: data.userId,
      },
    });

    return Movie.fromJSON(movie);
  }

  /**
   * Metodo para obtener todas las peliculas
   * @returns Array de peliculas
   */

  async getAllMovies(): Promise<Movie[]> {
    const movies = await this.prisma.movie.findMany();

    return movies.map((movie) => Movie.fromJSON(movie));
  }

  /**
   * Metodo para obtener todas las peliculas de un usuario
   * @param userId ID del usuario
   * @returns Array de peliculas
   */

  async getMoviesByUserId(userId: number): Promise<Movie[]> {
    const movies = await this.prisma.movie.findMany({
      where: {
        userId,
      },
    });

    return movies.map((movie) => Movie.fromJSON(movie));
  }

  /**
   * Método para actualizar una película
   * @param id ID de la película
   * @param data Datos de la película
   * @returns Instancia de Movie
   */

  async updateMovie(data: {
    title: string;
    description?: string | null;
    filePath: string;
    userId: number;
  }): Promise<Movie> {
    const movie = await this.prisma.movie.update({
      where: {
        id: data.userId,
      },
      data: {
        title: data.title,
        description: data.description,
        filePath: data.filePath,
        userId: data.userId,
      },
    });

    return Movie.fromJSON(movie);
  }

  /**
   * Metodo para eliminar una pelicula
   * @param id ID de la pelicula
   * @returns Instancia de Movie
   */

  async deleteMovie(id: number): Promise<Movie> {
    const movie = await this.prisma.movie.delete({
      where: {
        id,
      },
    });

    return Movie.fromJSON(movie);
  }

  /**
   * Método para obtener una película por su ID
   * @param id ID de la película
   * @returns Instancia de Movie
   */
  async getMovieByFilePath(data: { userId: number, filePath: string }): Promise<Movie> {
    const movie = await this.prisma.movie.findFirst({
      where: {
        userId: data.userId,
        filePath: data.filePath,
      },
    });

    return Movie.fromJSON(movie);
  }
}
