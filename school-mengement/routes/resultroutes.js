const express = require("express");

const {
    createresult,
    getAllResults,
    getResults,
    getResultId,
    updateResult,
    deleteResult
} = require("../controllers/resultcontroll");

const Protect = require("../middleware/authmiddleware");
const rolmiddleware = require("../middleware/rollmiddleware");

const router = express.Router();

router.post("/", Protect, rolmiddleware("Admin", "Teacher"), createresult);
router.get("/", Protect, rolmiddleware("Admin", "Teacher", "Student", "Parent"), getAllResults);
router.get("/student/:studentId", Protect, rolmiddleware("Admin", "Teacher", "Student", "Parent"), getResults);
router.get("/:id", Protect, rolmiddleware("Admin", "Teacher", "Student", "Parent"), getResultId);
router.put("/:id", Protect, rolmiddleware("Admin", "Teacher"), updateResult);
router.delete("/:id", Protect, rolmiddleware("Admin", "Teacher"), deleteResult);

module.exports = router;