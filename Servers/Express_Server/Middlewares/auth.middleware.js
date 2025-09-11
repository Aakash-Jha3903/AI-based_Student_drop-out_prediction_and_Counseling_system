const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");
const { ACCESS_TOKEN_SECRET } = process.env;

module.exports = async function (req, res, next) {
    try {
        const token = req.headers.token;
        if (!token) {
            return res.json({ msg: "Missing token", rcode: -9, data: "" });
        }
        jwt.verify(token, ACCESS_TOKEN_SECRET, async function (err, decode) {
            if (err) {
                if (err.name === "JsonWebTokenError") {
                    return res.json({ msg: "Please Login before acccess the service ", rcode: -9, data: "" });
                }
                if (err.name === "TokenExpiredError") {
                    return res.json({ msg: "Session expired, please login again", rcode: -9, data: "" });
                }
            } else {
                // Attach minimal user info to req
                try {
                    const user = await UserModel.findOne({ Email: decode.Email }).select("_id Role School");
                    if (user) {
                        req.user = { id: user._id, role: user.Role, school: user.School };
                    }
                } catch (_) { }
                return next();
            }
        });
    } catch (e) {
        return res.json({ msg: "Auth error", rcode: -9, data: "" });
    }
};
