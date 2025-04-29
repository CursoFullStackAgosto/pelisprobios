import { RequestHandler, Router } from "express";
import { MovieController } from "../controllers/movie.oop.controller";
import { verifyToken } from "../middleware/auth.middleware";

const moviesRoutes = Router();
const movieController = new MovieController();

moviesRoutes.use(verifyToken);

moviesRoutes.post('/create-movie', movieController.createMovie as RequestHandler);
moviesRoutes.get('/', movieController.getAllMovies as RequestHandler);
moviesRoutes.get('/get-movie-by-userId/:userId', movieController.getMoviesByUserId as RequestHandler);
moviesRoutes.post('/update-movie/:movieId', movieController.updateMovie as RequestHandler);
moviesRoutes.delete('/delete-movie/:movieId', movieController.deleteMovie as RequestHandler);
moviesRoutes.post('/scan-directory', movieController.scanDirectoryCtrl as RequestHandler);
moviesRoutes.get('/list-home-folders', movieController.listHomeFoldersCtrl as RequestHandler);

export default moviesRoutes;