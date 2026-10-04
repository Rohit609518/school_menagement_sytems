const mongoose = require("mongoose");
const dns = require("dns");

// Use public DNS to avoid querySrv ECONNREFUSED with MongoDB Atlas SRV records
try {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
    console.warn("Could not set custom DNS servers:", e.message);
}

const seedDefaultUsers = async () => {
    try {
        const User = require("../models/user");
        const bcrypt = require("bcryptjs");

        const adminExists = await User.findOne({ role: "Admin" });
        if (!adminExists) {
            const hashpassword = await bcrypt.hash("admin123", 12);
            await User.create({
                name: "Administrator",
                email: "admin@school.com",
                password: hashpassword,
                role: "Admin"
            });
            console.log("✓ Default Admin created: admin@school.com / admin123");
        }
    } catch (err) {
        console.error("Auto-seed error:", err.message);
    }
};

const connectDB = async () => {
    try {
        if (!process.env.MOGODB_URL) {
            console.error("WARNING: MOGODB_URL is not set in environment variables!");
            return;
        }
        await mongoose.connect(process.env.MOGODB_URL, {
            serverSelectionTimeoutMS: 10000,
        });
        console.log("Database connected successfully");
        await seedDefaultUsers();
    } catch (error) {
        console.error("MongoDB Connection Error:", error.message);
    }
};

module.exports = connectDB;
