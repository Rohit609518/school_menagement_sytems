const express = require("express");

const {
    Attendancemark,
    getAttendance,
    getAttendanceBystudent,
    getupdateAttendance,
    getdeleteByattendance
} = require("../controllers/attendancemark");

const router = express.Router();

const Protect = require("../middleware/authmiddleware");
const rolmiddleware = require("../middleware/rollmiddleware");

router.post("/",Protect, rolmiddleware("Admin","Teacher"),Attendancemark);

router.get("/",Protect,rolmiddleware("Admin", "Teacher", "Student", "Parent"),getAttendance);
router.get("/student/:studentId",Protect,rolmiddleware("Admin", "Teacher", "Student", "Parent"),getAttendanceBystudent);
router.put("/:id",Protect,rolmiddleware("Admin","Teacher"),getupdateAttendance);
router.delete("/:id",Protect,rolmiddleware("Admin"),getdeleteByattendance);

module.exports = router;