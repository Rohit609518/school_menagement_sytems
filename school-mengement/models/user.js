const mongoose = require("mongoose")

const Userschama = new mongoose.Schema({

     name:{
        type:String,
        required:true
     },
     email:{
        type:String,
        required:true,
        unique:true
     },
     password:{
        type:String,
        required:true,
        length:6
     },
     role:{
       type:String,
       enum: ["Admin", "Teacher", "Student", "Parent"],
       default:"Student"
     },
   

},{timestamps:true})

module.exports =
    mongoose.models.User ||
    mongoose.model("User", Userschama);