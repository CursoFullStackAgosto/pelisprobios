import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from 'body-parser';
import logger from "./utils/logger";
import path from "path";
import fs from 'fs';
import morganMiddleware from "./middleware/morgan.middleware";
import { debugRequestMiddleware } from "./middleware/debug.middleware";
import { errorConverter, errorHandler, notFoundHandler } from "./middleware/error.middleware";
import router from "./routes";

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

// Middlewares de logging y debugging
app.use(morganMiddleware);
app.use(debugRequestMiddleware);

// Ruta principal de la API
app.use('/api/v1', router);

// Middleware para rutas no encontradas
app.use(notFoundHandler);

// Middleware de manejo de errores
app.use(errorConverter);
app.use(errorHandler);

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  logger.error('Excepción no controlada:');
  logger.error(error);

  // Cerrando el servidor en caso de error crítico
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  logger.error('Promesa rechazada no manejada:');
  logger.error(error);
})

app.listen(PORT, () => {
  logger.info(`==================================`);
  logger.info(`🚀 Servidor iniciando en el puerto ${PORT} 🚀`);
  logger.info(`🌎 Entorno: ${process.env.NODE_ENV ?? 'development'}`)
  logger.info(`🔍 Debug: ${process.env.DEBUG === 'true' ? 'Activado' : 'Desactivado'}`);
  logger.info(`==================================`);
})
