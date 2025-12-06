const { messageModel } = require("../models/message");
const { channelModel } = require("../models/channel");
const mongoose = require("mongoose");

const handleGetMessages = async (req, res) => {
    try {
        const { channelId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        // console.log("Getting messages for channelId:", channelId);

        const channel = await channelModel.findById(channelId);
        if (!channel) return res.status(404).json({ message: "Channel not found" });

        const messages = await messageModel.find({ channelId : new mongoose.Types.ObjectId(channelId) }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit)).populate({ path: "sender", select: "username" });

        res.json({ messages: messages.reverse() });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

const handleCreateMessage = async (req, res) => {
    try {
        const { channelId, text } = req.body;

        if (!text) return res.status(400).json({ message: "Content required" });

        const message = await messageModel.create({
            sender: req.user._id,
            channelId,
            text,
        });

        res.status(201).json(message);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

module.exports = {
    handleCreateMessage,
    handleGetMessages
}