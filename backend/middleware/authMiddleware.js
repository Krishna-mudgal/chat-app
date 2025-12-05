const jwt = require("jsonwebtoken");
const {userModel} = require("../models/user");
require("dotenv").config();

const auth = async (req, res, next) => {
    const token = req.cookies.token;

    if(!token) return res.status(401).json({
        message: "Authentication failed"
    })

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        const user = await userModel.findById(decoded.userId);
        if(!user) return res.status(404).json({
            message: "Authentication failed"
        })

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid token"
        });
    }
}

module.exports = {auth};