import { Router } from "express";
import { getUserCtrl } from "../controllers/user.controller";
import { verifyToken } from "../middleware/auth.middleware";


const userRoutes = Router();

userRoutes.get('/:userId', verifyToken ,async (request, response) => {
  await getUserCtrl(request, response);
});

export default userRoutes;