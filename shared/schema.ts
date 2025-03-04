import { pgTable, text, serial, numeric, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const landmarks = pgTable("landmarks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  lat: numeric("lat").notNull(),
  lng: numeric("lng").notNull(),
  wikipediaId: text("wikipedia_id"),
  thumbnail: text("thumbnail"),
  isUserContributed: boolean("is_user_contributed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertLandmarkSchema = createInsertSchema(landmarks).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true
});

export type InsertLandmark = z.infer<typeof insertLandmarkSchema>;
export type Landmark = typeof landmarks.$inferSelect;

export const boundingBoxSchema = z.object({
  north: z.number(),
  south: z.number(),
  east: z.number(),
  west: z.number(),
});

export type BoundingBox = z.infer<typeof boundingBoxSchema>;