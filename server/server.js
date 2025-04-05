// server/index.js
const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// Import routes
const codeBlockRoutes = require("./routes/codeBlockRoute");

const app = express();
const server = http.createServer(app);

// Set up Socket.io
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*", // We'll later restrict this to the React app's URL
    methods: ["GET", "POST"],
  },
});

// Middlewares
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/codeblocks", codeBlockRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Keep track of the mentor for each room
const mentors = {};

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // When a user joins a specific room (code block)
  socket.on("join-room", (roomId) => {
    socket.join(roomId);

    // Count students in room (excluding mentor)
    const clients = io.sockets.adapter.rooms.get(roomId)?.size || 1;
    const studentsCount = mentors[roomId] ? clients - 1 : 0;

    // Broadcast student count to room
    io.to(roomId).emit("students-count", studentsCount);

    // Handle code changes
    socket.on("code-change", (code) => {
      // Broadcast update to all users in room except sender
      socket.to(roomId).emit("code-update", code);
    });

    // New event for solution solved
    socket.on("solution-solved", () => {
      io.to(roomId).emit("solution-solved");
    });

    // If no mentor exists for this room – this socket becomes the mentor
    if (!mentors[roomId]) {
      mentors[roomId] = socket.id;
      socket.emit("role", "mentor");
    } else {
      // Otherwise – this socket is a student
      socket.emit("role", "student");
      
      // Update student count when a new student joins
      const updatedClients = io.sockets.adapter.rooms.get(roomId)?.size || 0;
      const updatedStudentsCount = updatedClients - 1;
      io.to(roomId).emit("students-count", updatedStudentsCount);
    }

    // If this user disconnects
    socket.on("disconnect", () => {
      // Check if the disconnected user was the mentor
      if (mentors[roomId] === socket.id) {
        // Remove the mentor from the map
        delete mentors[roomId];

        // Notify all users in the room that the mentor has left
        io.to(roomId).emit("mentor-left");
      } else {
        // Update student count if a student disconnected
        const updatedClients = io.sockets.adapter.rooms.get(roomId)?.size || 0;
        const updatedStudentsCount = updatedClients - 1; // Subtract mentor
        io.to(roomId).emit("students-count", Math.max(0, updatedStudentsCount));
      }
    });
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});