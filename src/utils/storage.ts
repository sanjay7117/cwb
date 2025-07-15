import { rooms, drawingOperations, type Room, type InsertRoom, type DrawingOperation, type InsertDrawingOperation, type CanvasState } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getRoom(id: string): Promise<Room | undefined>;
  createRoom(room: InsertRoom): Promise<Room>;
  updateRoomCanvasData(roomId: string, canvasData: CanvasState): Promise<void>;
  updateRoomActivity(roomId: string): Promise<void>;
  addDrawingOperation(operation: InsertDrawingOperation): Promise<DrawingOperation>;
  getRoomDrawingOperations(roomId: string): Promise<DrawingOperation[]>;
  clearRoomDrawingOperations(roomId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private rooms: Map<string, Room>;
  private drawingOps: Map<string, DrawingOperation[]>;
  private currentId: number;

  constructor() {
    this.rooms = new Map();
    this.drawingOps = new Map();
    this.currentId = 1;
  }

  async getRoom(id: string): Promise<Room | undefined> {
    return this.rooms.get(id);
  }

  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const room: Room = {
      ...insertRoom,
      canvasData: { paths: [], shapes: [], emojis: [] },
      createdAt: new Date(),
      lastActivity: new Date(),
    };
    this.rooms.set(room.id, room);
    this.drawingOps.set(room.id, []);
    return room;
  }

  async updateRoomCanvasData(roomId: string, canvasData: CanvasState): Promise<void> {
    const room = this.rooms.get(roomId);
    if (room) {
      room.canvasData = canvasData;
      room.lastActivity = new Date();
      this.rooms.set(roomId, room);
    }
  }

  async updateRoomActivity(roomId: string): Promise<void> {
    const room = this.rooms.get(roomId);
    if (room) {
      room.lastActivity = new Date();
      this.rooms.set(roomId, room);
    }
  }

  async addDrawingOperation(operation: InsertDrawingOperation): Promise<DrawingOperation> {
    const drawingOp: DrawingOperation = {
      id: this.currentId++,
      ...operation,
      timestamp: new Date(),
    };
    
    const roomOps = this.drawingOps.get(operation.roomId) || [];
    roomOps.push(drawingOp);
    this.drawingOps.set(operation.roomId, roomOps);
    
    return drawingOp;
  }

  async getRoomDrawingOperations(roomId: string): Promise<DrawingOperation[]> {
    return this.drawingOps.get(roomId) || [];
  }

  async clearRoomDrawingOperations(roomId: string): Promise<void> {
    this.drawingOps.set(roomId, []);
  }
}

export class DatabaseStorage implements IStorage {
  async getRoom(id: string): Promise<Room | undefined> {
    const [room] = await db.select().from(rooms).where(eq(rooms.id, id));
    return room || undefined;
  }

  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const [room] = await db
      .insert(rooms)
      .values({
        ...insertRoom,
        canvasData: { paths: [], shapes: [], emojis: [] },
      })
      .returning();
    return room;
  }

  async updateRoomCanvasData(roomId: string, canvasData: CanvasState): Promise<void> {
    await db
      .update(rooms)
      .set({ 
        canvasData,
        lastActivity: new Date(),
      })
      .where(eq(rooms.id, roomId));
  }

  async updateRoomActivity(roomId: string): Promise<void> {
    await db
      .update(rooms)
      .set({ lastActivity: new Date() })
      .where(eq(rooms.id, roomId));
  }

  async addDrawingOperation(operation: InsertDrawingOperation): Promise<DrawingOperation> {
    const [drawingOp] = await db
      .insert(drawingOperations)
      .values(operation)
      .returning();
    return drawingOp;
  }

  async getRoomDrawingOperations(roomId: string): Promise<DrawingOperation[]> {
    return await db
      .select()
      .from(drawingOperations)
      .where(eq(drawingOperations.roomId, roomId))
      .orderBy(drawingOperations.timestamp);
  }

  async clearRoomDrawingOperations(roomId: string): Promise<void> {
    await db
      .delete(drawingOperations)
      .where(eq(drawingOperations.roomId, roomId));
  }
}

export const storage = new DatabaseStorage();
