const mongoose = require("mongoose");
const dns = require("dns");

try {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
    console.warn("Could not set custom DNS servers:", e.message);
}

const seedDefaultUsers = async () => {
    try {
        const User = require("../models/user");
        const Student = require("../models/student");
        const Teacher = require("../models/teacher");
        const Parent = require("../models/Parent");
        const Attendance = require("../models/attendnace");
        const Homework = require("../models/Homework");
        const Exam = require("../models/Exam");
        const Result = require("../models/result");
        const Fees = require("../models/Fees");
        const Meeting = require("../models/meeting");
        const bcrypt = require("bcryptjs");

        // 1. Master Admin
        const adminEmail = "admin@school.com";
        const adminPass = "Admin@123";
        const hashAdmin = await bcrypt.hash(adminPass, 12);

        let adminUser = await User.findOne({ email: adminEmail });
        if (!adminUser) {
            adminUser = await User.create({
                name: "Administrator",
                email: adminEmail,
                password: hashAdmin,
                role: "Admin"
            });
            console.log(`✓ Admin created: ${adminEmail} / ${adminPass}`);
        } else {
            adminUser.password = hashAdmin;
            adminUser.role = "Admin";
            await adminUser.save();
        }

        // 2. Demo Teacher
        const teacherEmail = "teacher@school.com";
        const teacherPass = "Teacher@123";
        const hashTeacher = await bcrypt.hash(teacherPass, 12);

        let teacherUser = await User.findOne({ email: teacherEmail });
        if (!teacherUser) {
            teacherUser = await User.create({
                name: "Prof. Sarah Jenkins",
                email: teacherEmail,
                password: hashTeacher,
                role: "Teacher"
            });
            console.log(`✓ Teacher user created: ${teacherEmail} / ${teacherPass}`);
        }

        let teacherDoc = await Teacher.findOne({ email: teacherEmail });
        if (!teacherDoc) {
            teacherDoc = await Teacher.create({
                user: teacherUser._id,
                name: "Prof. Sarah Jenkins",
                email: teacherEmail,
                phone: "+1 (555) 234-5678",
                subject: "Mathematics & Science",
                experience: 8,
                salary: 65000
            });
            console.log(`✓ Teacher profile created: ${teacherEmail}`);
        } else if (!teacherDoc.user) {
            teacherDoc.user = teacherUser._id;
            await teacherDoc.save();
        }

        // 3. Demo Student
        const studentEmail = "student@school.com";
        const studentPass = "Student@123";
        const hashStudent = await bcrypt.hash(studentPass, 12);

        let studentUser = await User.findOne({ email: studentEmail });
        if (!studentUser) {
            studentUser = await User.create({
                name: "Alex Johnson",
                email: studentEmail,
                password: hashStudent,
                role: "Student"
            });
            console.log(`✓ Student user created: ${studentEmail} / ${studentPass}`);
        }

        let studentDoc = await Student.findOne({ email: studentEmail });
        if (!studentDoc) {
            studentDoc = await Student.create({
                user: studentUser._id,
                name: "Alex Johnson",
                email: studentEmail,
                age: 16,
                gender: "Male",
                studentclass: "10th - Section A"
            });
            console.log(`✓ Student profile created: ${studentEmail}`);
        } else if (!studentDoc.user) {
            studentDoc.user = studentUser._id;
            await studentDoc.save();
        }

        // 4. Demo Parent
        const parentEmail = "parent@school.com";
        const parentPass = "Parent@123";
        const hashParent = await bcrypt.hash(parentPass, 12);

        let parentUser = await User.findOne({ email: parentEmail });
        if (!parentUser) {
            parentUser = await User.create({
                name: "Robert Johnson",
                email: parentEmail,
                password: hashParent,
                role: "Parent"
            });
            console.log(`✓ Parent user created: ${parentEmail} / ${parentPass}`);
        }

        let parentDoc = await Parent.findOne({
            $or: [{ email: parentEmail }, { user: parentUser._id }]
        });
        if (!parentDoc) {
            parentDoc = await Parent.create({
                user: parentUser._id,
                name: "Robert Johnson",
                email: parentEmail,
                phone: "+1 (555) 987-6543",
                student: studentDoc._id
            });
            console.log(`✓ Parent profile created and linked to student: ${studentEmail}`);
        } else {
            parentDoc.user = parentUser._id;
            parentDoc.email = parentEmail;
            parentDoc.student = studentDoc._id;
            await parentDoc.save();
        }

        // Seed Sample Academic Records if empty for studentDoc
        const attCount = await Attendance.countDocuments({ student: studentDoc._id });
        if (attCount === 0) {
            await Attendance.create([
                { student: studentDoc._id, status: "Present", date: new Date(Date.now() - 86400000 * 2) },
                { student: studentDoc._id, status: "Present", date: new Date(Date.now() - 86400000) },
                { student: studentDoc._id, status: "Present", date: new Date() }
            ]);
            console.log("✓ Sample attendance seeded");
        }

        const hwCount = await Homework.countDocuments({ student: studentDoc._id });
        if (hwCount === 0) {
            await Homework.create([
                {
                    teacher: teacherDoc._id,
                    student: studentDoc._id,
                    subject: "Mathematics",
                    title: "Calculus Derivatives & Integrals",
                    description: "Complete exercises 4.1 to 4.5 from chapter 4.",
                    duedate: new Date(Date.now() + 86400000 * 3)
                },
                {
                    teacher: teacherDoc._id,
                    student: studentDoc._id,
                    subject: "Science",
                    title: "Physics Lab: Electromagnetism",
                    description: "Write up the experiment report on magnetic field induction.",
                    duedate: new Date(Date.now() + 86400000 * 5)
                }
            ]);
            console.log("✓ Sample homework seeded");
        }

        const examCount = await Exam.countDocuments({ student: studentDoc._id });
        if (examCount === 0) {
            await Exam.create([
                {
                    student: studentDoc._id,
                    subject: "Mathematics",
                    examname: "Mid-Term Examination",
                    totalsmark: 100,
                    obtainedMarks: 92,
                    examDate: new Date(Date.now() - 86400000 * 10)
                },
                {
                    student: studentDoc._id,
                    subject: "Physics",
                    examname: "Unit Test 2",
                    totalsmark: 50,
                    obtainedMarks: 45,
                    examDate: new Date(Date.now() - 86400000 * 5)
                }
            ]);
            console.log("✓ Sample exams seeded");
        }

        const resultCount = await Result.countDocuments({ student: studentDoc._id });
        if (resultCount === 0) {
            await Result.create([
                {
                    student: studentDoc._id,
                    Semester: "Semester 1",
                    Subject: "Mathematics",
                    totalmarks: 100,
                    obtainedMarks: 94
                },
                {
                    student: studentDoc._id,
                    Semester: "Semester 1",
                    Subject: "Science",
                    totalmarks: 100,
                    obtainedMarks: 88
                }
            ]);
            console.log("✓ Sample results seeded");
        }

        const feeCount = await Fees.countDocuments({ student: studentDoc._id });
        if (feeCount === 0) {
            await Fees.create({
                student: studentDoc._id,
                totalAmount: 45000,
                paidAmount: 45000,
                paymentMethod: "Bank Transfer",
                status: "paid"
            });
            console.log("✓ Sample fees seeded");
        }

        const meetCount = await Meeting.countDocuments({ student: studentDoc._id });
        if (meetCount === 0) {
            await Meeting.create({
                student: studentDoc._id,
                teacher: teacherDoc._id,
                parentName: "Robert Johnson",
                meetingDate: new Date(Date.now() + 86400000 * 2),
                meetingTime: "10:30 AM",
                reson: "Term Academic Performance Review",
                remarks: "Discussing student excellence in STEM and elective options",
                status: "Scheduled"
            });
            console.log("✓ Sample parent-teacher meeting seeded");
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