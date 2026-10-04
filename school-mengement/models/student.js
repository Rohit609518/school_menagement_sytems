const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");



const studentdata = new mongoose.Schema(

  {

    user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true,
    sparse: true
    },
    
      name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    password:{
     type:String,
     required:false,
     select:false,
     minlength:6
    },
    age:{
        type:Number,
        default: 18
    },
    gender:{
        type:String,
        enum:["Male","Female","Other"],
        default: "Male"
    },
    studentclass:{
        type:String,
        default: "10th"
    },

  },
    {
    timestamps:true
});


studentdata.pre('save', async function () {
    
    if (!this.password || !this.isModified("password")) {
        return;
    }

    if (this.password.startsWith("$2b$") || this.password.startsWith("$2a$")) {
        return;
    }

    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(this.password,salt);

    this.password = hash ;
})

const Student = mongoose.model("Student",studentdata);

module.exports = Student ;