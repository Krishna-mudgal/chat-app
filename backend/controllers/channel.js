const bcrypt = require("bcryptjs");
const { channelModel } = require("../models/channel");

const handleCreateChannel = async (req, res) => {
    try {
        const { name, type = "public", password, description } = req.body;
        const adminId = req.user._id;

        if (!name || !name.trim()) return res.status(400).json({ message: "Channel name required" });

        const exists = await channelModel.findOne({ name: name.trim() });
        if (exists) return res.status(400).json({ message: "Channel name already exists" });

        let hashed = undefined;
        if (type === "private") {
            if (!password || !password.trim()) return res.status(400).json({ message: "Password required for private channel" });
            hashed = await bcrypt.hash(password, 10);
        }

        const channel = await channelModel.create({
        name: name.trim(),
        type,
        password: hashed,
        admin: adminId,
        members: [adminId],
        description
        });

        res.status(201).json({ message: "Channel created", channel });
  } catch (err) {
        console.error("createChannel error:", err);
        res.status(500).json({ message: "Server error" });
  }
};

const handleJoinChannel = async (req, res) => {
    try {
        const { name, password } = req.body;
        if (!name || !name.trim()) return res.status(400).json({ message: "Channel name required" });

        const channel = await channelModel.findOne({ name: name.trim() });
        if (!channel) return res.status(404).json({ message: "Channel not found" });

        if (channel.members.some(m => m.toString() === req.user._id.toString())) {
            return res.status(200).json({ message: "Already a member", channel });
        }

        if (channel.type === "private") {
            if (!password) return res.status(403).json({ message: "Password required for private channel" });

            const result = await bcrypt.compare(password, channel.password || "");
            if (!result) return res.status(403).json({ message: "Incorrect password" });
        }

        channel.members.push(req.user._id);
        await channel.save();

        res.json({ message: "Joined channel", channel });
    } catch (err) {
        console.error("joinChannel error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

const handleGetMyChannels = async (req, res) => {
    try {
        const channels = await channelModel.find({ members: req.user._id }).select("-password").populate("admin", "username").populate("members", "username").sort({ updatedAt: -1 });

        res.json({ channels });
    } catch (err) {
        console.error("getMyChannels error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

const handleGetChannelInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const channel = await channelModel.findById(id).select("-password").populate("admin", "username");

        if (!channel) {
            return res.status(404).json({ message: "Channel not found" });
        }

        const userId = req.user._id.toString();
        const isAdmin = channel.admin._id.toString() === userId;

        if (channel.type === "private") {
            if (isAdmin) {
                await channel.populate("members", "username lastSeen online");
            } else {
                channel.members = [];
            }
        } else {
            await channel.populate("members", "username lastSeen online");
        }

        const channelObj = channel.toObject();
        delete channelObj.password;

        res.json(channelObj);
  } catch (err) {
    console.error("getChannelById error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const handleCheckChannelType = async (req, res) => {
    try {
        const { name } = req.query;
        if (!name) return res.status(400).json({ message: "Name required" });

        const channel = await channelModel.findOne({ name: name.trim() });
        if (!channel) return res.status(404).json({ message: "Channel not found" });

        res.json({ type: channel.type });
    } catch (err) {
        console.error("checkChannel error:", err);
        res.status(500).json({ message: "Server error" });
    }
}

module.exports = {
    handleCheckChannelType,
    handleCreateChannel,
    handleGetChannelInfo,
    handleGetMyChannels,
    handleJoinChannel
}