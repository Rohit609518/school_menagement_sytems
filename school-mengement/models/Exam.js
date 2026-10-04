const mongoose = require("mongoose");

const weeklexams = new mongoose.Schema(
    {
  student:{
    type:mongoose.Types.ObjectId,
    ref:"Student",
    required:true
  },
  subject:{
    type:String,
    required:true
  },
  examname:{
    type:String,
    required:true
  },
  totalsmark:{
    type:Number,
    required:true,
    min:0
  },
 obtainedMarks: {
   type: Number,
   required: true,
   min: 0
        },
 examDate: {
   type: Date,
    required: true
}
},
{
 timestamps:true
}
)

const Exam = mongoose.model("Exam",weeklexams);

module.exports = Exam ;