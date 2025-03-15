import { Router } from "express";
import { loginCtrl, registerCtrl, setupTwoFactorAuthCtrl } from "../controllers/auth.controller";
import { request } from "http";

const authRoutes = Router();

authRoutes.post('/register', async (request, response) => {
  await registerCtrl(request, response);
});

authRoutes.post('/login', async (request, response) => {
  await loginCtrl(request, response);
});

authRoutes.post('/setup-2fa', async (request, response) => {
  await setupTwoFactorAuthCtrl(request, response);
});

export default authRoutes;