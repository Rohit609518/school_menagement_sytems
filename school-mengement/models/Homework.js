const mongoose =  require ("mongoose");

const Homworkshecma = new mongoose.Schema(
    {
   teacher:{
    type:mongoose.Types.ObjectId,
    ref:"Teacher",
    required:true,
   },
   student:{
    type:mongoose.Types.ObjectId,
    ref:"Student",
    required:true
   },
   subject:{
    type:String,
    required:true
   },
   title:{
    type:String,
    required:true
   },
   description:{
    type:String,
    required:true
   },
   duedate:{
    type:Date,
    required:true
   }
},
{
    timestamps:true
}
);

const Homework =  mongoose.model("Homework",Homworkshecma);

module.exports = Homework ;