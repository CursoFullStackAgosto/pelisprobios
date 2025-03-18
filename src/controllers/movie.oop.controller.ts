import { PrismaClient } from "@prisma/client";
import { MovieService } from "../services/MovieService";
import { ApiError } from "../middleware/error.middleware";

export class MovieController {
  private movieService: MovieService;
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
    this.movieService = new MovieService(this.prisma);
  }

  async createMovie(request, response, next) {
    try {
      const { title, description, filePath, userId } = request.body;

      const movie = await this.movieService.createMovie({
        title,
        description,
        filePath,
        userId,
      });

      response.status(201).json(movie);
    } catch (error) {
      console.error('Error al crear la película:', error);
      next(new ApiError(500, 'Error al crear la película'));
    }
  }
}