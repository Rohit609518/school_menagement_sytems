const jwt = require("jsonwebtoken");

const Protect = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        console.log("AUTH HEADER:", authHeader);

        if (!authHeader) {
            return res.status(401).json({
                message: "Authorization header missing"
            });
        }

        const parts = authHeader.trim().split(/\s+/);

        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(401).json({
                message: "Invalid Authorization format"
            });
        }

        const token = parts[1];

        console.log("TOKEN RECEIVED:", !!token);
        console.log("JWT SECRET EXISTS:", !!process.env.JWT_SECRET);

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        console.log("DECODED:", decoded);

        req.user = decoded;

        next();

    } catch (error) {
        console.log("JWT ERROR:", error.message);

        return res.status(401).json({
            message: "Not authorized, invalid token"
        });
    }
};

module.exports = Protect;