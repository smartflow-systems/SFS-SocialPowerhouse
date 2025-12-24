import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";
import { fileURLToPath } from "url";
import { dirname } from "path";
import rateLimit from "express-rate-limit";

const __dirname = dirname(fileURLToPath(import.meta.url));

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

const staticFallbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 fallback requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "../dist/public");
  
  // Create dist/public if it doesn't exist
  if (!fs.existsSync(distPath)) {
    try {
      fs.mkdirSync(distPath, { recursive: true });
      log("Created dist/public directory", "express");
    } catch (e) {
      log(`Failed to create dist/public: ${e}`, "express");
    }
  }

  // Serve static files
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
  }

  // Fall through to index.html if the file exists, otherwise serve a simple page
  app.use("*", staticFallbackLimiter, (_req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(200).set({ "Content-Type": "text/html" }).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>SFS Social PowerHouse</title>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; background: #0D0D0D; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .box { text-align: center; padding: 2rem; }
            h1 { color: #FFD700; margin: 0 0 1rem 0; }
            .status { background: rgba(255,215,0,0.1); border: 1px solid #FFD700; border-radius: 8px; padding: 1rem; margin-top: 1rem; font-family: monospace; font-size: 0.9rem; }
            .status.ok { border-color: #4ade80; color: #4ade80; background: rgba(74,222,128,0.1); }
          </style>
        </head>
        <body>
          <div class="box">
            <h1>SFS Social PowerHouse</h1>
            <p>AI-Powered Social Media Management Platform</p>
            <div id="status" class="status">Checking API...</div>
          </div>
          <script>
            fetch('/api/health').then(r=>r.json()).then(d=>{
              const s=document.getElementById('status');
              s.className='status ok';
              s.textContent='✓ API Ready: '+d.status;
            }).catch(e=>{
              document.getElementById('status').textContent='✗ Error: '+e.message;
            });
          </script>
        </body>
        </html>
      `);
    }
  });
}
