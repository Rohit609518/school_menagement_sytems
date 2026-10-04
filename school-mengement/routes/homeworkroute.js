const express = require("express");

const {
    createHomework,
    gethomework,
    getMyHomework,
    getChildHomework,
    gethomeworkID,
    updateHomework,
    deleteHomework,
    gethomeworkByStudent
} = require("../controllers/homeworkcontrol");

const Protect = require("../middleware/authmiddleware");
const rolmiddleware = require("../middleware/rollmiddleware");

const router = express.Router();

router.post("/", Protect, rolmiddleware("Admin", "Teacher"), createHomework);
router.get("/my", Protect, rolmiddleware("Student"), getMyHomework);
router.get("/child", Protect, rolmiddleware("Parent"), getChildHomework);
router.get("/", Protect, rolmiddleware("Admin", "Teacher"), gethomework);

router.get(
    "/student/:studentId",
    Protect,
    rolmiddleware("Admin", "Teacher", "Student", "Parent"),
    gethomeworkByStudent
);

router.get(
    "/:id",
    Protect,
    rolmiddleware("Admin", "Teacher", "Student", "Parent"),
    gethomeworkID
);

router.put(
    "/:id",
    Protect, 
    rolmiddleware("Admin", "Teacher"),
    updateHomework
);

router.delete(
    "/:id",
    Protect, 
    rolmiddleware("Admin", "Teacher"),
    deleteHomework
);

module.exports = router;