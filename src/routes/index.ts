import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import moviesRoutes from './movies.routes';

const router = Router();
// Agrupar todas las rutas bajo /api/v1 o la ruta que se especifique
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/movies', moviesRoutes);

export default router;