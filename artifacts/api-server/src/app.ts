import express, { type Express } from "express";
import cors from "cors";
import session from "express-session";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

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

app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------------------------------
// Session middleware — MemoryStore (MVP).
// TODO (Phase 4): Replace MemoryStore with connect-pg-simple for production.
// ---------------------------------------------------------------------------
const isProduction = process.env["NODE_ENV"] === "production";

// Trust the first proxy hop (Replit's TLS-terminating reverse proxy) so that
// Express reads X-Forwarded-For correctly and secure cookies are set reliably.
if (isProduction) {
  app.set("trust proxy", 1);
}

const SESSION_SECRET = process.env["SESSION_SECRET"];
if (!SESSION_SECRET) {
  if (isProduction) {
    // Never start in production without an explicit secret — prevents cookie
    // forgery attacks from an accidental default value.
    throw new Error("SESSION_SECRET environment variable is required in production.");
  }
  console.warn(
    "[SECURITY] SESSION_SECRET is not set. Using a temporary insecure secret for development only.",
  );
}
const sessionSecret = SESSION_SECRET ?? "tranquility-dev-only-secret-do-not-use-in-prod";

app.use(
  session({
    name: "th.sid",
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "strict",
      // In production (Replit deployment), requests arrive over HTTPS via proxy.
      // In development, allow the cookie over HTTP.
      secure: isProduction,
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
    },
  }),
);

app.use("/api", router);

export default app;
