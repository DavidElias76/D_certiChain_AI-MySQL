import express from "express";
import dotenv from "dotenv";
import type { Request, Response, Express, NextFunction } from "express"
import cors from "cors"
import helmet from "helmet"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import connectDB from "./config/DbConnection"
import authRoutes from "./routes/auth.routes"
import usersRoutes from "./routes/users.routes"
import certificateRoutes from "./routes/certificate.routes"
import institutionRoutes from "./routes/institution.routes"

dotenv.config();

const app: Express = express();
const PORT: number = Number(process.env.PORT) || 8080;

app.use(cors({
    origin: process.env.CLIENT_URL as string || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(helmet()); 
app.use(bodyParser.json());
app.use(cookieParser());

//  routes
app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes); // This needs to be tested
app.use('/api/certificate', certificateRoutes);
app.use('/api/institution', institutionRoutes); // System admin - institution management

// sever health check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
      message: 'Something went wrong. Server is down!'
    });
  }
);

const startServer = async (): Promise<void> => {
    try {
        await connectDB(); // This runs the database connection
        app.listen(PORT, (): void => {
            console.log(`Server running at http://localhost:${PORT}`)
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

startServer();