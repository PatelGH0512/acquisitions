import express from 'express';
import logger from './config/logger.js';
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import { uptime } from 'process';
import authRoutes from './routes/auth.routes.js';


const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use(morgan("combined", { stream: { write: (message) => logger.info(message.trim()) } }));

app.get('/', (req, res) => {
  logger.info('Received GET request for /');
  res.status(200).send('Hello from the Acquisitions API!');
});

app.get("/health", (req, res) => {
    logger.info("Received GET request for /health");
    res.status(200).json({
        status: "success",
        message: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

app.use("/api/auth", authRoutes);

export default app;
