const express = require("express");

const {
    createfees,
    getFees,
    getMyFees,
    getChildFees,
    getFeesByStudent,
    getFeesId,
    updateFees,
    deleteFees
} = require("../controllers/feescontroll");

const Protect = require("../middleware/authmiddleware");
const rolmiddleware = require("../middleware/rollmiddleware");

const router = express.Router();

// Fees Manage: Admin and Teacher can create/record fees
router.post("/", Protect, rolmiddleware("Admin", "Teacher"), createfees);

// Student gets their own fees
router.get("/my", Protect, rolmiddleware("Student"), getMyFees);

// Parent gets their child's fees
router.get("/child", Protect, rolmiddleware("Parent"), getChildFees);

// Admin and Teacher can view all fees
router.get("/", Protect, rolmiddleware("Admin", "Teacher"), getFees);

// Student/Parent/Teacher/Admin specific student lookup
router.get("/student/:studentId", Protect, rolmiddleware("Admin", "Teacher", "Parent", "Student"), getFeesByStudent);
router.get("/:id", Protect, rolmiddleware("Admin", "Teacher", "Parent", "Student"), getFeesId);

// Fees Manage (update) is Admin and Teacher, delete is Admin ONLY
router.put("/:id", Protect, rolmiddleware("Admin", "Teacher"), updateFees);
router.delete("/:id", Protect, rolmiddleware("Admin"), deleteFees);

module.exports = router;