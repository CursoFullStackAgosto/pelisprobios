import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import bodyParser from 'body-parser';
import userRoutes from "./routes/user.routes";
import moviesRoutes from "./routes/movies.routes";
import logger from "./utils/logger";
import path from "path";
import fs from 'fs';
import morganMiddleware from "./middleware/morgan.middleware";

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir)
}

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

app.use(morganMiddleware);

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/movies', moviesRoutes);

app.listen(PORT, () => {
  logger.info(`==================================`);
  logger.info(`🚀 Servidor iniciando en el puerto ${PORT} 🚀`);
  logger.info(`🌎 Entorno: ${process.env.NODE_ENV ?? 'development'}`)
  logger.info(`🔍 Debug: ${process.env.DEBUG === 'true' ? 'Activado' : 'Desactivado'}`);
  logger.info(`==================================`);
})
