const express = require("express");

const {
    createMeeting,
    getMeeting,
    getMeetingById,
    getMeetingUpdate,
    deleteMeeting
} = require("../controllers/meetingcontrol");

const Protect = require("../middleware/authmiddleware");
const rolmiddleware = require("../middleware/rollmiddleware");

const router = express.Router();

router.post("/", Protect, rolmiddleware("Admin", "Teacher"), createMeeting);
router.get("/", Protect, rolmiddleware("Admin", "Teacher", "Parent", "Student"), getMeeting);
router.get("/:id", Protect, rolmiddleware("Admin", "Teacher", "Parent", "Student"), getMeetingById);
router.put("/:id", Protect, rolmiddleware("Admin", "Teacher"), getMeetingUpdate);
router.delete("/:id", Protect, rolmiddleware("Admin"), deleteMeeting);

module.exports = router;