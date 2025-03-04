import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { boundingBoxSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fetchLandmarksInBoundingBox } from "./services/wikipedia";

export async function registerRoutes(app: Express) {
  // Add test endpoint to verify server functionality
  app.get("/api/test", (_req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  app.get("/api/landmarks", async (req, res) => {
    const startTime = Date.now();
    console.log(`[API] GET /api/landmarks - Starting request`);

    try {
      const bbox = boundingBoxSchema.parse({
        north: Number(req.query.north),
        south: Number(req.query.south),
        east: Number(req.query.east),
        west: Number(req.query.west),
      });

      console.log(`[API] Validated bounding box: ${JSON.stringify(bbox)}`);

      // Get cached landmarks first
      let landmarks = await storage.getLandmarks(bbox);
      console.log(`[API] Retrieved ${landmarks.length} landmarks from cache`);

      // Always fetch new landmarks from Wikipedia
      const newLandmarks = await fetchLandmarksInBoundingBox(bbox);
      if (newLandmarks.length > 0) {
        await storage.cacheLandmarks(newLandmarks);
        landmarks = await storage.getLandmarks(bbox);
        console.log(`[API] Added ${newLandmarks.length} new landmarks to cache`);
      }

      console.log(`[API] Request completed in ${Date.now() - startTime}ms`);
      res.json(landmarks);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error(`[API] Invalid bounding box parameters:`, error.errors);
        res.status(400).json({ error: "Invalid bounding box parameters" });
      } else {
        console.error("[API] Error fetching landmarks:", error);
        res.status(500).json({ error: "Failed to fetch landmarks" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}