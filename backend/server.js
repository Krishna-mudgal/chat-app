const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { connectDB } = require("./db");
const { userRouter } = require("./routes/user");
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

server.listen(5000, () => console.log("Server running on 5000"));