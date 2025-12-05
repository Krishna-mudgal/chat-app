const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { connectDB } = require("./db");
const { userRouter } = require("./routes/user");
const { channelRouter } = require("./routes/channel");
const { messageRouter } = require("./routes/message");
const { messageModel } = require("./models/message");
const { auth } = require("./middleware/authMiddleware")
const { createServer } = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
    origin: "http://localhost:5173",
    credentials: true,
  }
});

const onlineUsers = {};

io.on("connection", (socket) => {
  console.log("New socket connected:", socket.id);

  socket.on("joinChannel", async ({ channelId, userId, username }) => {
    if (!onlineUsers[userId]) onlineUsers[userId] = { socketId : socket.id, username, channels: [] };
    onlineUsers[userId].channels.push(channelId);

    socket.join(channelId);

    const usersInChannel = Object.values(onlineUsers)
      .filter(u => u.channels.includes(channelId))
      .map(u => ({ username: u.username, _id: u.userId, online: true }));

    io.to(channelId).emit("onlineUsers", usersInChannel);

    console.log(`${username} joined channel ${channelId}`);
  });

  socket.on("sendMessage", async ({ channelId, senderId, text }) => {
    try {
      const message = await messageModel.create({
        sender: senderId,
        channel: channelId,
        content: text,
      });

      const populatedMessage = await message.populate("sender", "username");

      io.to(channelId).emit("newMessage", populatedMessage);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  });

  // Typing indicator
  socket.on("typing", ({ channelId, username }) => {
    socket.to(channelId).emit("typing", { username });
  });

  socket.on("stopTyping", ({ channelId, username }) => {
    socket.to(channelId).emit("stopTyping", { username });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);

    // Remove user from onlineUsers
    for (const userId in onlineUsers) {
      const index = onlineUsers[userId].channels.findIndex(() => true);
      if (index !== -1) {
        onlineUsers[userId].channels.splice(index, 1);
      }
      if (onlineUsers[userId].channels.length === 0) delete onlineUsers[userId];
    }

    Object.keys(io.sockets.adapter.rooms).forEach((channelId) => {
      const usersInChannel = Object.values(onlineUsers)
        .filter(u => u.channels.includes(channelId))
        .map(u => ({ username: u.username, online: true }));

      io.to(channelId).emit("onlineUsers", usersInChannel);
    });
  });
});

connectDB(process.env.MONGO_URL).then(() => console.log("MongoDb connected")).catch(() => console.log("MongoDb disconnected"));

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api", userRouter);
app.use("/api/channels", auth, channelRouter);
app.use("/api/messages", auth, messageRouter);

server.listen(5000, () => console.log("Server running on 5000"));