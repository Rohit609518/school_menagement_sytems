const express = require("express");

const {
    createParent,
    getParents,
    getParentById,
    getMyProfile,
    updateParent,
    deleteParent
} = require("../controllers/parentcontrol");

const Protect = require("../middleware/authmiddleware");
const rolmiddleware = require("../middleware/rollmiddleware");

const router = express.Router();

router.post(
    "/",
    Protect,
    rolmiddleware("Admin"),
    createParent
);

router.get(
    "/",
    Protect,
    rolmiddleware("Admin", "Teacher"),
    getParents
);

router.get(
    "/my-profile",
    Protect,
    rolmiddleware("Parent"),
    getMyProfile
);

router.get(
    "/:id",
    Protect,
    rolmiddleware("Admin", "Teacher"),
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

module.exports = router;