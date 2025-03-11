import omdbApi from "../config/axios/omdb-api";
import { MovieDetails, MovieDraft } from "../entities/global.entities";

interface MovieDraftResponse {
  Search: MovieDraft[];
}

const API_KEY = process.env.IMDB_API_KEY;
const PARAM_LIST_SEARCH_BY_TITLE = "s";
const PARAM_MOVIE_DETAILS_BY_TITLE = "t";
const API_KEY_PARAM = `apikey=${API_KEY}`;



export const fetchDraftListMovies = async(title: string): Promise<MovieDraftResponse[] | null> => {
  try {

    const response = await omdbApi.get(`/?${PARAM_LIST_SEARCH_BY_TITLE}=${title}&type=movie&${API_KEY_PARAM}`);

    return response.data;
  } catch (error) {
    console.error("Error al obtener los detalles de la película:", error);
    return null;
  }
}

export const fetchMovieDetails = async(title: string): Promise<MovieDetails | null> => {
  try {
    const response = await omdbApi.get(`/?${PARAM_MOVIE_DETAILS_BY_TITLE}=${title}&${API_KEY_PARAM}`)
    
    return response.data;
  } catch (error) {
    console.error("Error al obtener los detalles de la película:", error);
    return null;
  }
}