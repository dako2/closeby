import { type Landmark, type InsertLandmark, type BoundingBox, landmarks } from "@shared/schema";
import { db } from "./db";
import { and, gte, lte } from "drizzle-orm";

export interface IStorage {
  getLandmarks(bbox: BoundingBox): Promise<Landmark[]>;
  cacheLandmarks(landmarks: InsertLandmark[]): Promise<void>;
  clearCache(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getLandmarks(bbox: BoundingBox): Promise<Landmark[]> {
    return await db.select()
      .from(landmarks)
      .where(
        and(
          gte(landmarks.lat, bbox.south),
          lte(landmarks.lat, bbox.north),
          gte(landmarks.lng, bbox.west),
          lte(landmarks.lng, bbox.east)
        )
      );
  }

  async cacheLandmarks(newLandmarks: InsertLandmark[]): Promise<void> {
    // Set isUserContributed to false for Wikipedia landmarks
    const landmarksToInsert = newLandmarks.map(landmark => ({
      ...landmark,
      isUserContributed: false
    }));

    await db.insert(landmarks)
      .values(landmarksToInsert)
      .onConflictDoNothing(); // Avoid duplicates based on primary key
  }

  async clearCache(): Promise<void> {
    // In database implementation, we don't clear the cache
    // Data persistence is handled by the database
    return;
  }
}

export const storage = new DatabaseStorage();