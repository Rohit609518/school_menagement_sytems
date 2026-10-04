const express = require("express");

const {
    createstudent,
    getStudent,
    getFindId,
    updatestudent,
    DeleteStudent,
    loginStudent,
    getMyprofile
} = require("../controllers/studentcontrol");

const Protect = require("../middleware/authmiddleware");
const rolmiddleware = require("../middleware/rollmiddleware");


const router = express.Router();

router.post("/", Protect, rolmiddleware("Admin", "Teacher"), createstudent);
router.post("/login", loginStudent);

router.get("/test", (req, res) => {
    res.json({
        message: "Student route is working"
    });
});

router.get(
    "/my-profile",
    Protect,
    rolmiddleware("Student"),
    getMyprofile
);
router.get("/",Protect,rolmiddleware("Admin","Teacher"),getStudent)

router.get("/:id", Protect, rolmiddleware("Admin", "Teacher", "Student", "Parent"), getFindId);

router.put("/:id", Protect, rolmiddleware("Admin", "Teacher"), updatestudent);

router.delete("/:id", Protect, rolmiddleware("Admin"), DeleteStudent);

module.exports = router ;