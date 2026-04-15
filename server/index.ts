import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import helmet from "helmet";
import path from "path";
import cors from "cors";
import MemoryStoreFactory from "memorystore";
import { registerRoutes } from "./routes";
import { log, serveStatic, setupVite } from "./vite";
import { appConfig } from "./config";
import { setupWebSocket } from "./websocket";

const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for Vite dev server
}));

app.set("trust proxy", 1);

// CORS for split Render frontend/backend (cookie-based session auth)
if (appConfig.clientUrl) {
  app.use(cors({
    origin: appConfig.clientUrl,
    credentials: true,
  }));
}

const MemoryStore = MemoryStoreFactory(session);
export const sessionMiddleware = session({
  store: new MemoryStore({
    checkPeriod: 86400000, // prune expired entries every 24h
  }),
  secret: appConfig.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    httpOnly: true,
    secure: appConfig.nodeEnv === "production",
    sameSite: appConfig.nodeEnv === "production" && appConfig.clientUrl ? "none" : "lax",
  },
});

app.use(sessionMiddleware);

app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      // Log request without sensitive response data
      let logMessage = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (res.statusCode >= 400) {
        // Only log response body for errors, and sanitize it
        const safeResponse = capturedJsonResponse ? JSON.stringify(capturedJsonResponse).substring(0, 200) + '...' : '';
        logMessage += ` Response: ${safeResponse}`;
      }
      log(logMessage);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);
  setupWebSocket(server);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    return;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (appConfig.nodeEnv === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Serve the app on the specified port or default to 5000
  server.listen(appConfig.port, "127.0.0.1", () => {
    const timestamp = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    console.log(`${timestamp} [express] serving on port ${appConfig.port}`);
  });
})();
