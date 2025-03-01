import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import bodyParser from 'body-parser';
import userRoutes from "./routes/user.routes";
import moviesRoutes from "./routes/movies.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/movies', moviesRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} 🚀`);
})
