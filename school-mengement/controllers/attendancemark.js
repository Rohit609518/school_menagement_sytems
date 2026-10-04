const Attendance = require("../models/attendnace");
const Student = require("../models/student");
const Parent = require("../models/Parent");

const Attendancemark = async (req, res) => {
    try {
        const { student, date, status } = req.body;

        if (!student || !status) {
            return res.status(400).json({
                message: "Student and status are required"
            });
        }

        const studentExist = await Student.findById(student);

        if (!studentExist) {
            return res.status(404).json({
                message: "student not found"
            });
        }

        const attendance = await Attendance.create({
            student,
            date: date || new Date(),
            status
        });

        const populatedAttendance = await Attendance.findById(attendance._id)
            .populate("student", "name email studentclass");

        res.status(201).json({
            message: "student attendance marked successfully",
            attendance: populatedAttendance
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getAttendance = async (req, res) => {
    try {
        let filter = {};

        // If logged-in user is Student, restrict to their own records
        if (req.user && req.user.role === "Student") {
            const studentDoc = await Student.findOne({
                $or: [{ user: req.user.id }, { _id: req.user.id }]
            });
            if (studentDoc) {
                filter.student = studentDoc._id;
            } else {
                return res.status(200).json({
                    message: "student attendance status",
                    attendance: []
                });
            }
        }

        // If logged-in user is Parent, restrict to their child's records
        if (req.user && req.user.role === "Parent") {
            const parentDoc = await Parent.findOne({ user: req.user.id });
            if (parentDoc) {
                filter.student = parentDoc.student;
            } else {
                return res.status(200).json({
                    message: "student attendance status",
                    attendance: []
                });
            }
        }

        const attendance = await Attendance.find(filter)
            .populate("student", "name email studentclass")
            .sort({ date: -1 });

        res.status(200).json({
            message: "student attendance status",
            attendance
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getAttendanceBystudent = async (req, res) => {
    try {
        const { studentId } = req.params;

        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({
                message: "student is not found"
            });
        }

        // Role authorization check for Student
        if (req.user && req.user.role === "Student") {
            const isOwn = String(student._id) === String(req.user.id) ||
                          (student.user && String(student.user._id || student.user) === String(req.user.id));
            if (!isOwn) {
                return res.status(403).json({
                    message: "You can only see your own attendance"
                });
            }
        }

        // Role authorization check for Parent
        if (req.user && req.user.role === "Parent") {
            const parent = await Parent.findOne({
                user: req.user.id,
                student: studentId
            });

            if (!parent) {
                return res.status(403).json({
                    message: "You can only see your child's attendance"
                });
            }
        }

        const attendance = await Attendance.find({
            student: studentId
        })
        .populate("student", "name email studentclass")
        .sort({ date: -1 });

        res.status(200).json({
            message: "student Attendance By Id",
            student,
            attendance
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getupdateAttendance = async (req, res) => {
    try {
        const { status, date } = req.body;

        const updateData = {};
        if (status !== undefined) updateData.status = status;
        if (date !== undefined) updateData.date = date;

        const attendance = await Attendance.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        ).populate("student", "name email studentclass");

        if (!attendance) {
            return res.status(404).json({
                message: "Attendance not found"
            });
        }

        res.status(200).json({
            message: "student Update successfully",
            attendance
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getdeleteByattendance = async (req, res) => {
    try {
        const attendance = await Attendance.findByIdAndDelete(req.params.id);

        if (!attendance) {
            return res.status(404).json({
                message: "Attendance not found"
            });
        }

        res.status(200).json({
            message: "Attendance is Delete",
            attendance
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getAttendancsBystudent = getAttendanceBystudent;

module.exports = {
    Attendancemark,
    getAttendance,
    getAttendanceBystudent,
    getupdateAttendance,
    getdeleteByattendance,
    getAttendancsBystudent
};