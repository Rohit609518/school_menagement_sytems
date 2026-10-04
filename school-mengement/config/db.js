const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        if (!process.env.MOGODB_URL) {
            console.error("WARNING: MOGODB_URL is not set in environment variables!");
            return;
        }
        await mongoose.connect(process.env.MOGODB_URL);
        console.log("Database connected successfully");
    } catch (error) {
        console.error("MongoDB Connection Error:", error.message);
    }
};

module.exports = connectDB;