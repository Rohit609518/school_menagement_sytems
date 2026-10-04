const mongoose = require("mongoose");

const meetingData = new mongoose.Schema(
    {
    student:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Student",
        required:true
    },
    teacher:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Teacher",
        required:true
    },
    parentName:{
        type:String,
        required:true,
        trim:true
    },
    meetingDate:{
        type:Date,
        required:true
    },
    meetingTime:{
        type:String,
        require:true
    },
    reson:{
        type:String,
        required:true,
        trim:true
    },
    remarks: {
    type: String,
    default: ""
   },
   status: {
    type: String,
    enum: ["Scheduled", "Completed", "Cancelled"],
    default: "Scheduled"
   }
},
{
    timestamps:true
}
);

const Meeting = mongoose.model("Meeting",meetingData);

module.exports = Meeting;