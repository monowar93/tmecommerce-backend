import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import session from "express-session";
import passport from "passport";
import { envVars } from "./app/config/env";
import "./app/config/passport";
import { connectUpstash } from "./app/config/uptash.redis";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { router } from "./app/routes";

const app = express();
const redisUrl = envVars.UPSTASH_REDIS_URL || "";
const allowedOrigins = envVars.FRONTEND_URL
  ? envVars.FRONTEND_URL.split(",")
  : [];

export const UpstashRedis = connectUpstash(redisUrl);

// Middleware for parsing JSON and URL-encoded data  body-parser lage na
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("trust proxy", 1);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(
  session({
    secret: envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  }),
);
app.use(passport.initialize());
app.use(passport.session());

// Setting up routes
app.use("/api/v1", router);

// Home route
app.get("/", (req: Request, res: Response) => {
  res.send("API Working with /api/v1 for TM-eCommerce-backEnd ec2");
});

// Catch-all route for undefined routes
app.use(notFound);

// Middleware for error handling
app.use(globalErrorHandler);

export default app;
