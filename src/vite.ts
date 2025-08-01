import { promises as fs } from "fs";
import { Server as HttpServer } from "http";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import express, { type Express } from "express";

const __dirname = dirname(fileURLToPath(import.meta.url));

export function log(message: string) {
  console.log(`[Backend] ${message}`);
}

export async function setupVite(app: Express, server: HttpServer) {
  // In production, serve static files from dist
  if (process.env.NODE_ENV === "production") {
    const distPath = resolve(__dirname, "../../dist/public");
    app.use(express.static(distPath));
    return;
  }

  // In development, setup Vite dev server
  try {
    const { createServer } = await import("vite");
    const viteServer = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: resolve(__dirname, "../../"),
    });

    app.use(viteServer.ssrFixStacktrace);
    app.use(viteServer.middlewares);
  } catch (error) {
    log("Warning: Vite setup failed, serving without HMR");
  }
}