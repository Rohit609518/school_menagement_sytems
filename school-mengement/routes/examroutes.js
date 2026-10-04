const express = require("express");

const {
    createExam,
    getexams,
    getExamsByStudent,
    getExamsId,
    updateExam,
    deleteExam
} = require("../controllers/examcontroll");

const Protect = require("../middleware/authmiddleware");
const rolmiddleware = require("../middleware/rollmiddleware");

const router = express.Router();

router.post("/", Protect, rolmiddleware("Admin", "Teacher"), createExam);
router.get("/", Protect, rolmiddleware("Admin", "Teacher"), getexams);
router.get("/student/:studentId", Protect, rolmiddleware("Admin", "Teacher", "Student", "Parent"), getExamsByStudent);

router.get("/:id", Protect, rolmiddleware("Admin", "Teacher", "Student", "Parent"), getExamsId);
router.put("/:id", Protect, rolmiddleware("Admin", "Teacher"), updateExam);
router.delete("/:id", Protect, rolmiddleware("Admin"), deleteExam);

module.exports = router;