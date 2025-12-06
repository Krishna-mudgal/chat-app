const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
    channelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "channel"
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    text: {
        type: String,
        required: true
    }
}, {timestamps : true});

const messageModel = mongoose.model("message", messageSchema);
module.exports = {messageModel};