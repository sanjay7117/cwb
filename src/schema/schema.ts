import { pgTable, text, serial, integer, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const rooms = pgTable("rooms", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  canvasData: json("canvas_data").default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastActivity: timestamp("last_activity").defaultNow().notNull(),
});

export const drawingOperations = pgTable("drawing_operations", {
  id: serial("id").primaryKey(),
  roomId: text("room_id").notNull(),
  type: text("type").notNull(), // 'pen', 'rectangle', 'circle', etc.
  data: json("data").notNull(), // tool-specific data
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRoomSchema = createInsertSchema(rooms).pick({
  id: true,
  name: true,
});

export const insertDrawingOperationSchema = createInsertSchema(drawingOperations).pick({
  roomId: true,
  type: true,
  data: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  email: true,
  password: true,
});

export const loginUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
});

export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Room = typeof rooms.$inferSelect;
export type InsertDrawingOperation = z.infer<typeof insertDrawingOperationSchema>;
export type DrawingOperation = typeof drawingOperations.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginUser = z.infer<typeof loginUserSchema>;

// Canvas-specific types
export interface DrawingPoint {
  x: number;
  y: number;
}

export interface DrawingPath {
  points: DrawingPoint[];
  color: string;
  width: number;
}

export interface Shape {
  type: 'rectangle' | 'circle' | 'line' | 'triangle' | 'arrow' | 'star';
  start: DrawingPoint;
  end: DrawingPoint;
  color: string;
  width: number;
}

export interface EmojiElement {
  id: string;
  emoji: string;
  position: DrawingPoint;
  size: number;
}

export interface CanvasState {
  paths: DrawingPath[];
  shapes: Shape[];
  emojis: EmojiElement[];
}