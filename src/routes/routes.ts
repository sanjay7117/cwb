import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./storage";
import { insertRoomSchema, insertDrawingOperationSchema, type CanvasState } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create or get room
  app.post("/api/rooms", async (req, res) => {
    try {
      const roomData = insertRoomSchema.parse(req.body);
      
      // Check if room already exists
      const existingRoom = await storage.getRoom(roomData.id);
      if (existingRoom) {
        return res.json(existingRoom);
      }
      
      const room = await storage.createRoom(roomData);
      res.json(room);
    } catch (error) {
      res.status(400).json({ message: "Invalid room data" });
    }
  });

  // Get room by ID
  app.get("/api/rooms/:id", async (req, res) => {
    try {
      const room = await storage.getRoom(req.params.id);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      res.json(room);
    } catch (error) {
      res.status(500).json({ message: "Failed to get room" });
    }
  });

  // Update room canvas data
  app.put("/api/rooms/:id/canvas", async (req, res) => {
    try {
      const canvasData = req.body as CanvasState;
      await storage.updateRoomCanvasData(req.params.id, canvasData);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to update canvas data" });
    }
  });

  // Add drawing operation
  app.post("/api/rooms/:id/operations", async (req, res) => {
    try {
      const operationData = insertDrawingOperationSchema.parse({
        ...req.body,
        roomId: req.params.id,
      });
      
      const operation = await storage.addDrawingOperation(operationData);
      res.json(operation);
    } catch (error) {
      res.status(400).json({ message: "Invalid drawing operation" });
    }
  });

  // Get room drawing operations
  app.get("/api/rooms/:id/operations", async (req, res) => {
    try {
      const operations = await storage.getRoomDrawingOperations(req.params.id);
      res.json(operations);
    } catch (error) {
      res.status(500).json({ message: "Failed to get drawing operations" });
    }
  });

  // Clear room canvas
  app.delete("/api/rooms/:id/canvas", async (req, res) => {
    try {
      await storage.clearRoomDrawingOperations(req.params.id);
      await storage.updateRoomCanvasData(req.params.id, { paths: [], shapes: [], emojis: [] });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear canvas" });
    }
  });

  const httpServer = createServer(app);
  
  // Initialize Socket.IO
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Socket.IO event handlers
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a room
    socket.on("join-room", (roomId: string) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
      
      // Notify other users in the room
      socket.to(roomId).emit("user-joined", { userId: socket.id });
      
      // Update room activity
      storage.updateRoomActivity(roomId);
    });

    // Handle drawing operations
    socket.on("drawing-operation", async (data: { roomId: string; operation: any }) => {
      try {
        // Save the drawing operation
        const savedOperation = await storage.addDrawingOperation({
          roomId: data.roomId,
          type: data.operation.type,
          data: data.operation
        });

        // Broadcast to all users in the room except sender
        socket.to(data.roomId).emit("drawing-operation", savedOperation);
        
        // Update room activity
        await storage.updateRoomActivity(data.roomId);
      } catch (error) {
        console.error("Error handling drawing operation:", error);
      }
    });

    // Handle canvas state updates
    socket.on("canvas-update", async (data: { roomId: string; canvasState: CanvasState }) => {
      try {
        // Save canvas state
        await storage.updateRoomCanvasData(data.roomId, data.canvasState);
        
        // Broadcast to all users in the room except sender
        socket.to(data.roomId).emit("canvas-update", data.canvasState);
        
        // Update room activity
        await storage.updateRoomActivity(data.roomId);
      } catch (error) {
        console.error("Error handling canvas update:", error);
      }
    });

    // Handle cursor tracking
    socket.on("cursor-move", (data: { roomId: string; x: number; y: number; userId?: string }) => {
      // Broadcast cursor position to other users in the room
      socket.to(data.roomId).emit("cursor-move", {
        ...data,
        userId: socket.id
      });
    });

    // Handle clearing canvas
    socket.on("clear-canvas", async (data: { roomId: string }) => {
      try {
        // Clear canvas in storage
        await storage.clearRoomDrawingOperations(data.roomId);
        await storage.updateRoomCanvasData(data.roomId, { paths: [], shapes: [], emojis: [] });
        
        // Broadcast to all users in the room
        socket.to(data.roomId).emit("canvas-cleared");
        
        // Update room activity
        await storage.updateRoomActivity(data.roomId);
      } catch (error) {
        console.error("Error clearing canvas:", error);
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return httpServer;
}