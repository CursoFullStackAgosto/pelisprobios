import axios from "axios";
import { MovieDraft } from "../entities/global.entities";

interface MovieDraftResponse {
  Search: MovieDraft[];
}

export const fetchDraftListMovies = async(title: string): Promise<MovieDraftResponse[] | null> => {
  try {
    const MAIN_URL = process.env.IMDB_API_URL;
    const API_KEY = process.env.IMDB_API_KEY;

    const response = await axios.get(`${MAIN_URL}?s=${title}&type=movie&apikey=${API_KEY}`);

    return response.data;
  } catch (error) {
    console.error("Error al obtener los detalles de la película:", error);
    return null;
  }
}