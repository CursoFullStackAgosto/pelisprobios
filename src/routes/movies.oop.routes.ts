import { RequestHandler, Router } from "express";
import { MovieController } from "../controllers/movie.oop.controller";
import { verifyToken } from "../middleware/auth.middleware";

const moviesRoutes = Router();
const movieController = new MovieController();

moviesRoutes.use(verifyToken);

moviesRoutes.post('/create-movie', movieController.createMovie as RequestHandler);
moviesRoutes.post('/scan-directory', movieController.scanDirectoryCtrl as RequestHandler);

export default moviesRoutes;