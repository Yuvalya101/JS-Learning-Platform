const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const codeBlockRoutes = require("./routes/codeBlockRoute");

const app = express();
const server = http.createServer(app);

// Set up Socket.io
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*", // You can restrict this to your frontend URL later
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/codeblocks", codeBlockRoutes);


// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Socket.IO - manage mentor-student logic
const mentors = {};

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);

    const clients = io.sockets.adapter.rooms.get(roomId)?.size || 1;
    const studentsCount = mentors[roomId] ? clients - 1 : 0;
    io.to(roomId).emit("students-count", studentsCount);

    socket.on("code-change", (code) => {
      socket.to(roomId).emit("code-update", code);
    });

    socket.on("solution-solved", () => {
      io.to(roomId).emit("solution-solved");
    });

    if (!mentors[roomId]) {
      mentors[roomId] = socket.id;
      socket.emit("role", "mentor");
    } else {
      socket.emit("role", "student");

      const updatedClients = io.sockets.adapter.rooms.get(roomId)?.size || 0;
      const updatedStudentsCount = updatedClients - 1;
      io.to(roomId).emit("students-count", updatedStudentsCount);
    }

    socket.on("disconnect", () => {
      if (mentors[roomId] === socket.id) {
        delete mentors[roomId];
        io.to(roomId).emit("mentor-left");
      } else {
        const updatedClients = io.sockets.adapter.rooms.get(roomId)?.size || 0;
        const updatedStudentsCount = updatedClients - 1;
        io.to(roomId).emit("students-count", Math.max(0, updatedStudentsCount));
      }
    });
  });
});
const seedRoute = require("./routes/seed");
app.use("/api", seedRoute);

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
