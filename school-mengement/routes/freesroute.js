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

router.post("/", Protect, rolmiddleware("Admin"), createfees);
router.get("/", Protect, rolmiddleware("Admin", "Parent", "Student"), getFees);
router.get("/student/:studentId", Protect, rolmiddleware("Admin", "Teacher", "Parent", "Student"), getFeesByStudent);

router.get("/:id", Protect, rolmiddleware("Admin", "Parent", "Student"), getFeesId);
router.put("/:id", Protect, rolmiddleware("Admin"), updateFees);
router.delete("/:id", Protect, rolmiddleware("Admin"), deleteFees);

module.exports = router;