import { Router } from "express";
import { loginCtrl, registerCtrl } from "../controllers/auth.controller";

const authRoutes = Router();

authRoutes.post('/register', async (request, response) => {
  await registerCtrl(request, response);
});

authRoutes.post('/login', async (request, response) => {
  await loginCtrl(request, response);
});

export default authRoutes;