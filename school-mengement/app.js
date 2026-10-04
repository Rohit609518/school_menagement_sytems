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

const app = express();



// Middleware 

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/students",studentroutes);
app.use("/api/teachers",teacherroutes);
app.use("/api/attendance",Attendancerouter);
app.use("/api/homework",Homeworkroute);
app.use("/api/exams", examRoutes);
app.use("/api/result",resultroutes);
app.use("/api/meeting",meetingroute);
app.use("/api/fees",fessrouter);
app.use("/api/auth",authrouter);
app.use("/api/parents", parentRoutes);



app.get("/", (req, res) => {

    res.send("student mengement system runing");
})

async function serverstart() {
    try {
        await connectDB();
    } catch (err) {
        console.error("Database connection failed:", err);
    }

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on port ${PORT}`);
    });
}

serverstart();

