require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const connectDB = require("./config/db");
connectDB();
const redis = require("./config/redis");

// Routes
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // allow all origins for now
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);

// Database connect
connectDB();

// Socket.IO Events
io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  // Join a chat room
  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined chat ${chatId}`);
  });

  // Send message
  socket.on("sendMessage", (message) => {
    console.log("📩 New message:", message);
    io.to(message.chat).emit("newMessage", message); // broadcast to chat room
  });

  // Presence (optional)
  socket.on("userOnline", (userId) => {
    console.log(`✅ User ${userId} is online`);
    io.emit("presenceUpdate", { userId, online: true });
    socket.userId = userId; // store for disconnect
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
    if (socket.userId) {
      io.emit("presenceUpdate", { userId: socket.userId, online: false });
    }
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
