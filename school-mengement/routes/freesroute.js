const express = require("express");

const {
    createfees,
    getFees,
    getFeesByStudent,
    getFeesId,
    updateFees,
    deleteFees
} = require("../controllers/feescontroll");

const Protect = require("../middleware/authmiddleware");
const rolmiddleware = require("../middleware/rollmiddleware");

const router = express.Router();

router.post("/", Protect, rolmiddleware("Admin", "Teacher"), createfees);
router.get("/", Protect, rolmiddleware("Admin", "Teacher", "Parent", "Student"), getFees);
router.get("/student/:studentId", Protect, rolmiddleware("Admin", "Teacher", "Parent", "Student"), getFeesByStudent);

router.get("/:id", Protect, rolmiddleware("Admin", "Teacher", "Parent", "Student"), getFeesId);
router.put("/:id", Protect, rolmiddleware("Admin", "Teacher"), updateFees);
router.delete("/:id", Protect, rolmiddleware("Admin", "Teacher"), deleteFees);

module.exports = router;