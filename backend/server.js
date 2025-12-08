const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { connectDB } = require("./db");
const { userRouter } = require("./routes/user");
const { channelRouter } = require("./routes/channel");
const { messageRouter } = require("./routes/message");
const { messageModel } = require("./models/message");
const { userModel } = require("./models/user");
const { auth } = require("./middleware/authMiddleware");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
    methods: ["GET", "POST"]
  }
});

const onlineUsers = {};

io.use((socket, next) => {
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");
    const token = cookies.token;
    
    if (!token) {
    //   console.log("No token in cookies");
      return next(new Error("No auth token"));
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    
    socket.user = {
      _id: decoded._id || decoded.userId,
      username: decoded.username,
    };

    // console.log("Socket authenticated:", socket.user);
    next();
  } catch (err) {
    console.error("Socket Auth Error:", err.message);
    next(new Error("Authentication failed"));
  }
});

io.on("connection", async (socket) => {
//   console.log("Socket connected:", socket.id);
  
  if (!socket.user) {
    console.log("No user - disconnecting");
    socket.disconnect();
    return;
  }

  const userId = socket.user._id;
  const username = socket.user.username;

  // Mark user online
  try {
    await userModel.findByIdAndUpdate(userId, { 
      online: true, 
      lastSeen: new Date() 
    });
    // console.log("User marked online:", username);
  } catch (err) {
    console.error("Failed to update online status:", err);
  }

  if (!onlineUsers[userId]) {
    onlineUsers[userId] = { socketId: socket.id, username, channels: [] };
  } else {
    onlineUsers[userId].socketId = socket.id;
  }

  // Join channel
  socket.on("joinChannel", ({ channelId }) => {
    // console.log("joinChannel:", { userId, channelId });
    
    socket.join(channelId);

    if (!onlineUsers[userId].channels.includes(channelId)) {
      onlineUsers[userId].channels.push(channelId);
    }

    const usersInChannel = Object.keys(onlineUsers)
      .filter((id) => onlineUsers[id].channels.includes(channelId))
      .map((id) => ({
        _id: id,
        username: onlineUsers[id].username,
        online: true,
      }));

    io.to(channelId).emit("onlineUsers", usersInChannel);
    // console.log(`${username} joined channel ${channelId}`);
  });

  // Send message - Sender + Room
  socket.on("sendMessage", async ({ channelId, text }) => {
    // console.log("sendMessage RECEIVED:", { userId, channelId, text: text.slice(0, 20) + "..." });
    
    try {
      const message = await messageModel.create({
        sender: userId,
        channelId,
        text: text.trim(),
      });
      
    //   console.log("Message SAVED:", message._id);
      
      // FIXED: Correct populate syntax for single document
      await message.populate("sender", "username");
      
    //   console.log("Populated sender:", message.sender?.username);
      
      // EMIT TO ROOM (others) + SENDER
      socket.to(channelId).emit("newMessage", message);  // Others in room
      socket.emit("newMessage", message);                 // Sender gets own message
      
    //   console.log("Message sent to room + sender:", channelId);
    } catch (err) {
    //   console.error("Send message ERROR:", err);
    }
  });

  // Typing indicator
  socket.on("typing", ({ channelId }) => {
    socket.to(channelId).emit("typing", { username });
  });

  socket.on("stopTyping", ({ channelId }) => {
    socket.to(channelId).emit("stopTyping", { username });
  });

  // Disconnect
  socket.on("disconnect", async (reason) => {
    console.log("🔌 Socket disconnected:", socket.id, reason);
    
    if (!userId) return;

    // Mark user offline
    try {
      await userModel.findByIdAndUpdate(userId, { 
        online: false, 
        lastSeen: new Date() 
      });
      console.log("User marked offline:", username);
    } catch (err) {
      console.error("Failed to update offline status:", err);
    }

    // Cleanup
    delete onlineUsers[userId];

    // Update all channels
    Object.keys(io.sockets.adapter.rooms).forEach((roomId) => {
      if (roomId === socket.id) return; // Skip socket rooms
      
      const usersInChannel = Object.keys(onlineUsers)
        .filter((id) => onlineUsers[id]?.channels?.includes(roomId))
        .map((id) => ({
          _id: id,
          username: onlineUsers[id].username,
          online: true,
        }));

      io.to(roomId).emit("onlineUsers", usersInChannel);
    });
  });
});

connectDB(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB failed:", err));

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use("/api", userRouter);
app.use("/api/channels", auth, channelRouter);
app.use("/api/messages", auth, messageRouter);

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});