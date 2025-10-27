const User = require("../models/User");

const isAdmin = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required for admin authentication" });
        }

        const user = await User.findOne({ email });
        if (!user || user.isAdmin !== 1) {
            return res.status(403).json({ message: "Access denied! Admins only." });
        }

        next();
    } catch (error) {
        console.error("Admin authentication error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = isAdmin;
