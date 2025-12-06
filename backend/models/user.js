const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    username : {
        type: String,
        required: true,
        unique: true
    },
    password : {
        type: String,
        required: true
    },
    lastSeen : {
        type: Date,
        default: Date.now()
    },
    online: { type: Boolean, default: false }, 
}, {timestamps: true});

const userModel = mongoose.model("user", userSchema);
module.exports = {
    userModel
}