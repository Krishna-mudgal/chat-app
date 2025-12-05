const express = require("express");
const { handleCheckChannelType, handleCreateChannel, handleGetChannelInfo, handleGetMyChannels, handleJoinChannel } = require("../controllers/channel");

const channelRouter = express.Router();
channelRouter.post("/create", handleCreateChannel);
channelRouter.post("/join", handleJoinChannel);
channelRouter.get("/my", handleGetMyChannels);
channelRouter.get("/check", handleCheckChannelType);
channelRouter.get("/:id", handleGetChannelInfo);

module.exports = {
    channelRouter
}