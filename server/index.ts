import dotenv from "dotenv";
import "dotenv/config";
import { fileURLToPath } from "url";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
console.log("Loaded DATABASE_URL =", process.env.DATABASE_URL);

// Instead of __dirname/__filename, use ESM-safe new URL
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

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
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  const tryListen = (p: number, attemptsLeft: number) => {
    const onError = (err: any) => {
      if (app.get("env") === "development" && err?.code === "EADDRINUSE" && attemptsLeft > 0) {
        const nextPort = p + 1;
        log(`port ${p} in use, retrying on ${nextPort}`);
        setTimeout(() => tryListen(nextPort, attemptsLeft - 1), 150);
      } else {
        throw err;
      }
    };

    server.once("error", onError);
    server.listen(p, "0.0.0.0", () => {
      server.off("error", onError);
      log(`serving on port ${p}`);
    });
  };

  tryListen(port, 10);
})();
