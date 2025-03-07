import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware";
import { crateMovieCtrl, getMoviesCtrl, scanDirectoryCtrl } from "../controllers/movie.controller";

const moviesRoutes = Router();

moviesRoutes.get('/scan-directory', verifyToken, async(request, response) => {
  await scanDirectoryCtrl(request, response);

})

moviesRoutes.get('/',verifyToken,async(request, response) => {
  await getMoviesCtrl(request, response);
})

moviesRoutes.post('/create-movie', verifyToken, async(request, response) => {
  await crateMovieCtrl(request, response);
})
export default moviesRoutes;