import express from "express";
import type { Request, Response, Express, NextFunction } from "express"
import cors from "cors"
import helmet from "helmet"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import config from "./config/config";
import connectDB from "./config/DbConnection"
import authRoutes from "./routes/auth.routes"
import usersRoutes from "./routes/users.routes"
import certificateRoutes from "./routes/certificate.routes"
import institutionRoutes from "./routes/institution.routes"
import recommendationsRouter from "./routes/recommendation.routes";

const app: Express = express();

const corsOptions = {
    origin: config.CLIENT_URL as string || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions));

app.use(express.json());
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin"}
})); 
app.use(bodyParser.json());
app.use(cookieParser());

//  routes
app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes);
app.use('/api/certificate', certificateRoutes);
app.use('/api/institution', institutionRoutes);
app.use('/api/recommendations', recommendationsRouter)

// sever health check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
      message: 'Something went wrong. Server is down!'
    });
  }
);

const startServer = async (): Promise<void> => {
    try {
        await connectDB();
        app.listen(config.PORT, (): void => {
            console.log(`Server running at http://localhost:${config.PORT}`)
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

startServer();