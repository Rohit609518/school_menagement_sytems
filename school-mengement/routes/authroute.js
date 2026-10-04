const express = require("express");

const {
  createRgesiter,
  loginuser,
  createAdmin
} = require("../controllers/authcontrooler");

const authmiddleware = require("../middleware/authmiddleware");

const router = express.Router();

router.post("/register",createRgesiter);

router.post("/login",loginuser);

router.post("/create-admin",createAdmin)

router.get("/profile",authmiddleware,(req,res)=>{

  res.json({
    message:"you can access protected route",
    user:req.user
  })
})

module.exports = router