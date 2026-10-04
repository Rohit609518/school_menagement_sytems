const express = require("express");

const {
    createParent,
    getParents,
    getParentById,
    getMyProfile,
    getChildren,
    updateParent,
    deleteParent,
    assignStudentToParent
} = require("../controllers/parentcontrol");

const Protect = require("../middleware/authmiddleware");
const rolmiddleware = require("../middleware/rollmiddleware");

const router = express.Router();

// Admin-only Parent Management
router.post(
    "/",
    Protect,
    rolmiddleware("Admin"),
    createParent
);

router.get(
    "/",
    Protect,
    rolmiddleware("Admin"),
    getParents
);

// Parent personal profile
router.get(
    "/my-profile",
    Protect,
    rolmiddleware("Parent"),
    getMyProfile
);

// Parent linked children
router.get(
    "/children",
    Protect,
    rolmiddleware("Parent", "Admin"),
    getChildren
);

router.get(
    "/:id",
    Protect,
    rolmiddleware("Admin"),
    getParentById
);

router.put(
    "/:id",
    Protect,
    rolmiddleware("Admin"),
    updateParent
);

router.delete(
    "/:id",
    Protect,
    rolmiddleware("Admin"),
    deleteParent
);

router.put(
    "/:id/assign-student",
    Protect,
    rolmiddleware("Admin"),
    assignStudentToParent
);

module.exports = router;