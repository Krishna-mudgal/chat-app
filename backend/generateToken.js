const jwt = require("jsonwebtoken"); 
require("dotenv").config();

const generateToken = (userId, username, res) => {
    const token = jwt.sign(
        {
            _id: userId,   
            username: username  
        }, 
        process.env.SECRET_KEY, 
        {expiresIn: "1d"}
    );

    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000
    });

    return token;
}

module.exports = {generateToken};