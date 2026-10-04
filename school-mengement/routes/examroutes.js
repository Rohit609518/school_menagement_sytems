const express = require("express");

const {
    createExam,
    getexams,
    getMyExams,
    getChildExams,
    getExamsByStudent,
    getExamsId,
    updateExam,
    deleteExam
} = require("../controllers/examcontroll");

const Protect = require("../middleware/authmiddleware");
const rolmiddleware = require("../middleware/rollmiddleware");

const router = express.Router();

router.post("/", Protect, rolmiddleware("Admin", "Teacher"), createExam);
router.get("/my", Protect, rolmiddleware("Student"), getMyExams);
router.get("/child", Protect, rolmiddleware("Parent"), getChildExams);
router.get("/", Protect, rolmiddleware("Admin", "Teacher"), getexams);

router.get("/student/:studentId", Protect, rolmiddleware("Admin", "Teacher", "Student", "Parent"), getExamsByStudent);
router.get("/:id", Protect, rolmiddleware("Admin", "Teacher", "Student", "Parent"), getExamsId);
router.put("/:id", Protect, rolmiddleware("Admin", "Teacher"), updateExam);
router.delete("/:id", Protect, rolmiddleware("Admin", "Teacher"), deleteExam);

module.exports = router;