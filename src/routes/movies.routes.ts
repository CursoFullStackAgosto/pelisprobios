import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware";
import { scanDirectoryCtrl } from "../controllers/movie.controller";

const moviesRoutes = Router();

moviesRoutes.get('/scan-directory', verifyToken, async(request, response) => {
  await scanDirectoryCtrl(request, response);

})

export default moviesRoutes;