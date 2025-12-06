const express = require("express");
const { handleLogin, handleSignup, handleGetUserProfile, handleUserLogout } = require("../controllers/user");
const {auth} = require("../middleware/authMiddleware");

const userRouter = express.Router();

userRouter.post("/signup", handleSignup);
userRouter.post("/login", handleLogin);
userRouter.get("/profile", auth, handleGetUserProfile);
userRouter.post("/logout", handleUserLogout);

module.exports = {
    userRouter
}