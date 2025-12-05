const express = require("express");
const { handleCreateMessage, handleGetMessages } = require("../controllers/message");

const messageRouter = express.Router();

messageRouter.post("/", handleCreateMessage);
messageRouter.get("/:channelId", handleGetMessages);

module.exports = {
    messageRouter
}