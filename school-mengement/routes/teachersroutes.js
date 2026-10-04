
const express = require("express");

const {
    createTeacher,
    getTeacher,
    getFindId,
    getUpdate,
    Deleteteacher
} = require("../controllers/teachercontroll");


   const Protect = require("../middleware/authmiddleware");
   const rolmiddleware = require("../middleware/rollmiddleware");
   const { getMyProfile } = require("../controllers/teachercontroll");


const router = express.Router();

router.post("/",Protect ,rolmiddleware("Admin"), createTeacher);

router.get("/",Protect,rolmiddleware("Admin","Teacher"), getTeacher);

router.get(
    "/my-profile",
    Protect,
    rolmiddleware("Teacher"),
    getMyProfile
);

router.get("/:id",Protect,rolmiddleware("Admin","Teacher"), getFindId);
router.put("/:id",Protect,rolmiddleware("Admin"),getUpdate);
router.delete("/:id",Protect,rolmiddleware("Admin"),Deleteteacher);

module.exports = router;

