import axios from "axios";

const MAIN_URL = process.env.IMDB_API_URL;

const omdbApi = axios.create({
  baseURL: MAIN_URL,
})

export default omdbApi;
