const rolmiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                message: "not authrize"
            });
        }

        const role = (req.user.role || "").toLowerCase();

        // 1. Super Admin bypass: Admin has full unrestricted master access to ALL endpoints
        if (role === "admin") {
            return next();
        }

        // 2. Case-insensitive role matching
        const normalizedAllowed = allowedRoles.map((r) => (r || "").toLowerCase());
        if (!normalizedAllowed.includes(role)) {
            return res.status(403).json({
                message: "Access denied. You don't have permission."
            });
        }

        next();
    };
};

module.exports = rolmiddleware;