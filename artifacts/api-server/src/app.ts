import express, { type Express } from "express";
import cors, { type CorsOptionsDelegate } from "cors";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pinoHttp from "pino-http";
import { pool } from "@workspace/db";
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

// CORS — credentialed requests are permitted only from this API's own host or
// from a deliberate comma-separated allowlist. Reflecting arbitrary origins
// with cookies would expose authenticated API responses to another site.
const corsOrigins = new Set(
  (process.env["CORS_ORIGINS"] ?? "")
  ?.split(",")
  .map((o) => o.trim())
  .filter(Boolean),
);
const corsOptions: CorsOptionsDelegate = (req, callback) => {
  const origin = req.headers.origin;
  if (!origin) {
    callback(null, { origin: false });
    return;
  }

  try {
    const isSameHost = new URL(origin).host === req.headers.host;
    callback(null, {
      origin: isSameHost || corsOrigins.has(origin) ? origin : false,
      credentials: true,
    });
  } catch {
    callback(null, { origin: false });
  }
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------------------------------
// Session middleware — persisted to Postgres so sessions survive restarts and
// can be shared across multiple server instances.
// ---------------------------------------------------------------------------
const isProduction = process.env["NODE_ENV"] === "production";

// Trust the first proxy hop so Express reads X-Forwarded-Proto/For correctly —
// required before it will set a Secure cookie behind Replit's TLS-terminating
// proxy. On Replit the app runs behind that proxy even in dev, so key off the
// Replit env, not just NODE_ENV.
const behindProxy =
  isProduction || !!process.env["REPL_ID"] || process.env["TRUST_PROXY"] === "1";
if (behindProxy) {
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

const PgSession = connectPgSimple(session);

// Cross-site cookie behavior. Default "lax" (fine when the SPA and API share an
// origin). When they're on different origins — e.g. two Replit URLs — set
// SESSION_COOKIE_SAMESITE=none so the browser will attach the session cookie to
// cross-site requests. "none" is only honored by browsers alongside Secure, so
// it forces the Secure flag on (which is why trust-proxy above must be set).
const cookieSameSite =
  (process.env["SESSION_COOKIE_SAMESITE"] as "lax" | "strict" | "none" | undefined) ?? "lax";
const cookieSecure = cookieSameSite === "none" ? true : isProduction;

app.use(
  session({
    name: "th.sid",
    store: new PgSession({
      pool,
      tableName: "user_sessions",
      // We create the table ourselves in ensureSessionTable() below.
      // connect-pg-simple's own creation reads a table.sql file relative to its
      // module dir, which does not survive esbuild bundling (__dirname points at
      // the bundle) — so leaving this on silently fails and no session persists.
      createTableIfMissing: false,
    }),
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: cookieSameSite,
      secure: cookieSecure,
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
    },
  }),
);

app.use("/api", router);

/**
 * Ensure the Postgres session table exists. We do this explicitly (rather than
 * connect-pg-simple's createTableIfMissing) because that path reads a bundled
 * table.sql off disk, which breaks once the server is bundled by esbuild. The
 * DDL matches the schema connect-pg-simple expects (sid / sess / expire) and is
 * idempotent, so it is safe to run on every startup. Call this before listen().
 */
export async function ensureSessionTable(): Promise<void> {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS "user_sessions" (
       "sid" varchar NOT NULL COLLATE "default" PRIMARY KEY,
       "sess" json NOT NULL,
       "expire" timestamp(6) NOT NULL
     );`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS "IDX_user_sessions_expire" ON "user_sessions" ("expire");`,
  );
}

export default app;
