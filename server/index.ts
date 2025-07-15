import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "../src/utils/db.js";
import { users, insertUserSchema, loginUserSchema } from "../src/schema/schema.js";
import { eq } from "drizzle-orm";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      
      if (!user) {
        return done(null, false, { message: 'Invalid email or password' });
      }
      
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return done(null, false, { message: 'Invalid email or password' });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// In-memory storage for rooms (replace with database in production)
const rooms = new Map();

// Authentication routes
app.post("/api/auth/signup", async (req, res) => {
  try {
    const userData = insertUserSchema.parse(req.body);
    
    // Check if user already exists
    const [existingUser] = await db.select().from(users).where(eq(users.email, userData.email));
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Create user
    const [newUser] = await db.insert(users).values({
      ...userData,
      password: hashedPassword
    }).returning();
    
    // Remove password from response
    const { password, ...userWithoutPassword } = newUser;
    
    res.status(201).json({ 
      message: "User created successfully", 
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(400).json({ message: "Invalid user data" });
  }
});

app.post("/api/auth/login", (req, res, next) => {
  passport.authenticate('local', (err: any, user: any, info: any) => {
    if (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
    if (!user) {
      return res.status(401).json({ message: info.message || "Authentication failed" });
    }
    
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ message: "Login failed" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json({ 
        message: "Login successful", 
        user: userWithoutPassword 
      });
    });
  })(req, res, next);
});

app.post("/api/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.json({ message: "Logout successful" });
  });
});

app.get("/api/auth/me", (req, res) => {
  if (req.isAuthenticated()) {
    const { password, ...userWithoutPassword } = req.user as any;
    res.json({ user: userWithoutPassword });
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a room
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
    
    // Initialize room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        id: roomId,
        canvasData: { paths: [], shapes: [], emojis: [] },
        users: new Set()
      });
    }
    
    const room = rooms.get(roomId);
    room.users.add(socket.id);
    
    // Send current canvas state to the new user
    socket.emit("canvas-update", room.canvasData);
    
    // Notify other users in the room
    socket.to(roomId).emit("user-joined", { userId: socket.id });
    
    // Send user count to all users in the room
    io.to(roomId).emit("user-count", room.users.size);
  });

  // Handle canvas updates
  socket.on("canvas-update", (data) => {
    const { roomId, canvasState } = data;
    
    if (rooms.has(roomId)) {
      rooms.get(roomId).canvasData = canvasState;
      // Broadcast to all users in the room except sender
      socket.to(roomId).emit("canvas-update", canvasState);
    }
  });

  // Handle cursor tracking
  socket.on("cursor-move", (data) => {
    const { roomId, x, y } = data;
    // Broadcast cursor position to other users in the room
    socket.to(roomId).emit("cursor-move", {
      userId: socket.id,
      x,
      y
    });
  });

  // Handle canvas clearing
  socket.on("clear-canvas", (data) => {
    const { roomId } = data;
    
    if (rooms.has(roomId)) {
      const emptyCanvas = { paths: [], shapes: [], emojis: [] };
      rooms.get(roomId).canvasData = emptyCanvas;
      // Broadcast to all users in the room
      io.to(roomId).emit("canvas-cleared");
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Remove user from all rooms
    for (const [roomId, room] of rooms.entries()) {
      if (room.users.has(socket.id)) {
        room.users.delete(socket.id);
        // Send updated user count
        io.to(roomId).emit("user-count", room.users.size);
        
        // Clean up empty rooms
        if (room.users.size === 0) {
          rooms.delete(roomId);
        }
      }
    }
  });
});

// API Routes
app.get("/api/rooms/:id", (req, res) => {
  const roomId = req.params.id;
  const room = rooms.get(roomId);
  
  if (room) {
    res.json({
      id: room.id,
      canvasData: room.canvasData,
      userCount: room.users.size
    });
  } else {
    res.status(404).json({ message: "Room not found" });
  }
});

app.post("/api/rooms", (req, res) => {
  const { id, name } = req.body;
  
  if (!rooms.has(id)) {
    rooms.set(id, {
      id,
      name: name || `Room ${id}`,
      canvasData: { paths: [], shapes: [], emojis: [] },
      users: new Set()
    });
  }
  
  const room = rooms.get(id);
  res.json({
    id: room.id,
    name: room.name,
    canvasData: room.canvasData,
    userCount: room.users.size
  });
});

// Serve React app for all other routes
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
  });
} else {
  app.get("*", (req, res) => {
    res.json({ message: "API server running. Use Vite dev server for frontend." });
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});