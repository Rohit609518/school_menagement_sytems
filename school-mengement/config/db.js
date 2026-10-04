const mongoose = require("mongoose");

const connectDB = async ()=>{
    try {
     await mongoose.connect(process.env.MOGODB_URL);
     console.log("connect database");
        
    } catch (error) {
        console.log(error.message);
        process.exit(1)
        
    }
}

module.exports = connectDB ;