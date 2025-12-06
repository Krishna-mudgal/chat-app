const bcrypt = require("bcryptjs");
const {generateToken} = require("../generateToken");
const {userModel} = require("../models/user");

const handleSignup = async (req, res) => {
    try {
        const {username, password} = req.body;
        if(!username || !password) return res.status(400).json({
            message: "in-sufficient details"
        })

        const hash = await bcrypt.hash(password, 10);
        const user = await userModel.create({
            username: username,
            password: hash
        })

        generateToken(user._id, user.username, res);
        res.json({
            message: "signup successfull"
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Server Error"
        })
    }
}

const handleLogin = async (req, res) => {
    try {
        const {username, password} = req.body;
        
        if(!username || !password) return res.status(400).json({
            message: "in-sufficient details"
        })

        const user = await userModel.findOne({username: username});

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const result = await bcrypt.compare(password, user.password);

        if(result) {
            generateToken(user._id, user.username, res);
            return res.json({
                message: "Login successfull"
            })
        } else {
            return res.status(400).json({ message: "Wrong password" });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
}

const handleGetUserProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const handleUserLogout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

module.exports = {
    handleLogin,
    handleSignup,
    handleGetUserProfile,
    handleUserLogout
}