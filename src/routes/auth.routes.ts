import { Router } from "express";
import { loginCtrl, registerCtrl, setupTwoFactorAuthCtrl } from "../controllers/auth.controller";
import { request } from "http";

const authRoutes = Router();

authRoutes.post('/register', async (request, response, next) => {
  await registerCtrl(request, response, next);
});

authRoutes.post('/login', async (request, response, next) => {
  await loginCtrl(request, response, next);
});

authRoutes.post('/setup-2fa', async (request, response, next) => {
  await setupTwoFactorAuthCtrl(request, response, next);
});

export default authRoutes;