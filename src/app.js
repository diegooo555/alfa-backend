import express from "express";
import cors from 'cors';
import userRoutes from "./routes/user.routes.js";
import taskRoutes from "./routes/task.routes.js"
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import pg from "pg";

const app = express();


config();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));

export const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true
  });

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(userRoutes);
app.use(taskRoutes);

export default app;