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

        generateToken(user._id, res);
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

        const result = await bcrypt.compare(password, user.password);

        if(result) {
            generateToken(user._id, res);
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

module.exports = {
    handleLogin,
    handleSignup
}