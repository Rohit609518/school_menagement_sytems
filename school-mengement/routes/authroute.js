const express = require("express");

const {
  createRgesiter,
  loginuser,
  createAdmin,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getSystemStats
} = require("../controllers/authcontrooler");

const authmiddleware = require("../middleware/authmiddleware");
const rolmiddleware = require("../middleware/rollmiddleware");

const router = express.Router();

router.post("/register", createRgesiter);
router.post("/login", loginuser);
router.post("/create-admin", createAdmin);

router.get("/profile", authmiddleware, (req, res) => {
  res.json({
    message: "Profile retrieved successfully",
    user: req.user
  });
});

// Admin-only User & Role Management and System Stats
router.get("/stats", authmiddleware, rolmiddleware("Admin"), getSystemStats);
router.get("/users", authmiddleware, rolmiddleware("Admin"), getAllUsers);
router.put("/users/:id/role", authmiddleware, rolmiddleware("Admin"), updateUserRole);
router.delete("/users/:id", authmiddleware, rolmiddleware("Admin"), deleteUser);

module.exports = router;