import { Request, Response } from "express";
import fs from "fs";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
  }
}

export const scanDirectoryCtrl = async (request: AuthenticatedRequest, response: Response) => {
  try {
    const { directoryPath } = request.body;
    const finalDirectoryPath = '/home/majomaken/develop/companies/bios/l7-group/learning/pelisprobios' + directoryPath;
    const userId  = request.body.user?.userId;

    if (!userId) {
      return response.status(401).json({
        message: "Usuario no autenticado",
      });
    }

    if (!directoryPath) {
      return response.status(400).json({
        message: "Ruta del directorio no proporcionada",
      });
    }

    if (!fs.existsSync(finalDirectoryPath)) {
      return response.status(404).json({
        message: "Directorio no encontrado",
      });
    }
    return response.status(200).json({
      message: "Directorio escaneado correctamente",
    });

  } catch (error) {
    console.error(error);
    return response.status(500).json({
      message: "Error al escanear el directorio",
    });
  }
}