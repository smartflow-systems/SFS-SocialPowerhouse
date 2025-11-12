import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import aiRouter from "./api/ai";

export async function registerRoutes(app: Express): Promise<Server> {
  // AI Content Generation Routes
  app.use("/api/ai", aiRouter);

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "SFS Social Powerhouse API" });
  });

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
