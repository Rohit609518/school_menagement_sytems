const mongoose = require("mongoose");

const resultschma = new mongoose.Schema(
    {
   student:{
    type:mongoose.Types.ObjectId,
    ref:"Student",
    required:true
   },
   Semester:{
    type:String,
    required:true
   },
   Subject:{
    type:String,
    required:true
   },
   totalmarks:{
    type:Number,
    required:true,
    min:0
   },
    obtainedMarks:{
    type:Number,
    required:true,
    min:0
    },
},
{
    timestamps:true
}

);

const Result = mongoose.model("Result",resultschma);

module.exports = Result ;