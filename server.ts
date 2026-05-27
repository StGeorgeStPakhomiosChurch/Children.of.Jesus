import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON bodies with a reasonable limit for bulk syncs
  app.use(express.json({ limit: '15mb' }));

  // API routes go here
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: process.env.NODE_ENV });
  });

  app.post("/api/sheets-sync", async (req, res) => {
    const { webAppUrl, action, payload } = req.body;
    
    if (!webAppUrl) {
      return res.status(400).json({ error: "Google Apps Script Web App URL is required" });
    }

    try {
      const response = await fetch(webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, ...payload }),
      });

      const dataText = await response.text();
      let data;
      try {
        data = JSON.parse(dataText);
      } catch {
        data = { text: dataText };
      }

      res.json({ success: true, data });
    } catch (error: any) {
      console.error("Error in sheets-sync proxy:", error);
      res.status(500).json({ 
        error: error.message || "Failed to communicate with Google Apps Script. Please verify the URL." 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(express.static(path.join(process.cwd(), 'public')));
    
    // Explicit root route for dev
    app.get('/', async (req, res, next) => {
      try {
        let template = await fs.promises.readFile(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml('/', template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });

    app.use(vite.middlewares);
    
    // Fallback for SPA in dev mode
    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) return next();
      try {
        let template = await fs.promises.readFile(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    const publicPath = path.join(process.cwd(), 'public');
    
    // Serve static files from dist and public
    app.use(express.static(distPath));
    app.use(express.static(publicPath));
    
    // Explicit root route for prod
    app.get('/', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });

    app.get('*', (req, res) => {
      if (req.originalUrl.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
      // Fallback to dist/index.html
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
