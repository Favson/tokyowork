import express, { type Express } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { originGuard } from "./middlewares/security";

const app: Express = express();
app.disable("x-powered-by");

const origins = [
  process.env.APP_ORIGIN,
  ...(process.env.ALLOWED_ORIGINS ?? "").split(","),
  process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null,
  "http://localhost:5173",
].filter((origin): origin is string => Boolean(origin)).map((origin) => origin.replace(/\/$/, ""));

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  credentials: false,
  methods: ["GET", "HEAD", "OPTIONS", "POST", "PATCH"],
  origin: origins,
}));
app.use(rateLimit({
  windowMs: 60_000,
  limit: 120,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again shortly." },
}));
app.use(originGuard);
app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: false, limit: "16kb" }));

app.use("/api", router);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err: error }, "Unhandled API error");
  res.status(500).json({ error: "An unexpected server error occurred." });
});

export default app;
