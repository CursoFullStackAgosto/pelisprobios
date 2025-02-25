import { Router } from "express";
import { registerCtrl } from "../controllers/auth.controller";

const authRoutes = Router();

authRoutes.post('/register', async (request, response) => {
  await registerCtrl(request, response);
});

export default authRoutes;