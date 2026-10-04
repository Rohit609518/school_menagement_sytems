require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const connectDB = require("./config/db");

const studentroutes = require("./routes/studentroutes");
const teacherroutes = require("./routes/teachersroutes");
const Attendancerouter = require("./routes/Attendanceroutes");
const Homeworkroute = require("./routes/homeworkroute");
const examRoutes = require("./routes/examroutes");
const resultroutes = require("./routes/resultroutes");
const meetingroute = require("./routes/meetingroute");
const fessrouter = require("./routes/freesroute");
const authrouter = require("./routes/authroute");
const parentRoutes = require("./routes/parentrouter");

const Protect = require("./middleware/authmiddleware");
const rolmiddleware = require("./middleware/rollmiddleware");
const { getChildren } = require("./controllers/parentcontrol");

const app = express();

// Middleware 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// Primary API Endpoints
app.use("/api/students", studentroutes);
app.use("/api/teachers", teacherroutes);
app.use("/api/attendance", Attendancerouter);
app.use("/api/homework", Homeworkroute);
app.use("/api/exams", examRoutes);
app.use("/api/result", resultroutes);
app.use("/api/results", resultroutes); // Alias for plural
app.use("/api/meeting", meetingroute);
app.use("/api/meetings", meetingroute); // Alias for plural
app.use("/api/fees", fessrouter);
app.use("/api/auth", authrouter);
app.use("/api/parents", parentRoutes);

// Direct /api/children endpoint for Parent role
app.get("/api/children", Protect, rolmiddleware("Parent", "Admin"), getChildren);

app.get("/api", (req, res) => {
    res.json({
        message: "School Management System API is running successfully",
        status: "active",
        endpoints: {
            auth: "/api/auth",
            students: "/api/students",
            teachers: "/api/teachers",
            attendance: "/api/attendance",
            homework: "/api/homework",
            exams: "/api/exams",
            results: "/api/results",
            meetings: "/api/meetings",
            fees: "/api/fees",
            parents: "/api/parents",
            children: "/api/children"
        }
    });
});

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date() });
});

// Serve Frontend SPA for all other routes
app.use((req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port http://localhost:${PORT}`);
    connectDB();
});

module.exports = app;
