const mongoose = require("mongoose");

const channelSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        required: true,
        enum: ["public", "private"],
        default: "public"
    },
    password: {
        type: String
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId, ref: "user"
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId, ref: "user"
    }]
}, {timeStamp: true});

const channelModel = mongoose.model("channel", channelSchema);
module.exports = {channelModel};