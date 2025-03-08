import fs from "fs";
import path from "path";
import { VIDEO_EXTENSIONS } from "../constants/global.constants";

export const getDirectoryStats = (directoryPath: string) => {
  try {
    let totalFiles = 0;
    let videoFiles = 0;
    let totalSubdirectories = 0;

    const countItems = (itemPath: string) => {
      try {
        const stats = fs.statSync(itemPath);

        if (stats.isDirectory()) {
          totalSubdirectories++;

          const items = fs.readdirSync(itemPath);

          for (const item of items) {
            countItems(path.join(itemPath, item));
          }
        } else if (stats.isFile()) {
          totalFiles++;

          const ext = path.extname(itemPath).toLowerCase();
          if (VIDEO_EXTENSIONS.includes(ext)) {
            videoFiles++;
          }
        }
      } catch (error) {
        console.error(`Error al procesar ${itemPath}:`, error);
      }
    }

    countItems(directoryPath);

    return {
      totalFiles,
      videoFiles,
      totalSubdirectories,
      error: false
    }
  } catch (error) {
    console.error(`Erro al obtener estadísticas de ${directoryPath}:`, error);
    return {
      totalFiles: 0,
      videoFiles: 0,
      totalSubdirectories: 0,
      error: true
    }
  }
}