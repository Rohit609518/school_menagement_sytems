const express = require("express");

const {
    Attendancemark,
    getAttendance,
    getMyAttendance,
    getChildAttendance,
    getAttendanceBystudent,
    getupdateAttendance,
    getdeleteByattendance
} = require("../controllers/attendancemark");

const router = express.Router();

const Protect = require("../middleware/authmiddleware");
const rolmiddleware = require("../middleware/rollmiddleware");

// Teacher and Admin can create attendance
router.post("/", Protect, rolmiddleware("Admin", "Teacher"), Attendancemark);

// Student gets their own attendance
router.get("/my", Protect, rolmiddleware("Student"), getMyAttendance);

// Parent gets their child's attendance
router.get("/child", Protect, rolmiddleware("Parent"), getChildAttendance);

// Admin and Teacher get all/relevant attendance
router.get("/", Protect, rolmiddleware("Admin", "Teacher"), getAttendance);

// Specific student lookup with ownership protection
router.get("/student/:studentId", Protect, rolmiddleware("Admin", "Teacher", "Student", "Parent"), getAttendanceBystudent);

// Teacher and Admin can update attendance
router.put("/:id", Protect, rolmiddleware("Admin", "Teacher"), getupdateAttendance);

// Only Admin can delete attendance records
router.delete("/:id", Protect, rolmiddleware("Admin"), getdeleteByattendance);

module.exports = router;