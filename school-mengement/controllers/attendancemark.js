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
                message: "Student not found"
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
            message: "Student attendance marked successfully",
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
                    message: "Student attendance status",
                    attendance: []
                });
            }
        }

        // If logged-in user is Parent, restrict to their child's records
        if (req.user && req.user.role === "Parent") {
            const parentDoc = await Parent.findOne({
                $or: [{ user: req.user.id }, { email: req.user.email?.toLowerCase() }]
            });
            if (parentDoc && parentDoc.student) {
                filter.student = parentDoc.student;
            } else {
                return res.status(200).json({
                    message: "Student attendance status",
                    attendance: []
                });
            }
        }

        const attendance = await Attendance.find(filter)
            .populate("student", "name email studentclass")
            .sort({ date: -1 });

        res.status(200).json({
            message: "Student attendance status",
            attendance
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// GET /api/attendance/my (Student only)
const getMyAttendance = async (req, res) => {
    try {
        const studentDoc = await Student.findOne({
            $or: [{ user: req.user.id }, { _id: req.user.id }, { email: req.user.email?.toLowerCase() }]
        });

        if (!studentDoc) {
            return res.status(200).json({
                message: "No student profile found for this account",
                attendance: []
            });
        }

        const attendance = await Attendance.find({ student: studentDoc._id })
            .populate("student", "name email studentclass")
            .sort({ date: -1 });

        res.status(200).json({
            message: "My attendance retrieved successfully",
            student: studentDoc,
            attendance
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/attendance/child (Parent only)
const getChildAttendance = async (req, res) => {
    try {
        const parentDoc = await Parent.findOne({
            $or: [{ user: req.user.id }, { email: req.user.email?.toLowerCase() }]
        }).populate("student", "name email studentclass");

        if (!parentDoc || !parentDoc.student) {
            return res.status(200).json({
                message: "No linked child found for this parent account",
                child: null,
                attendance: []
            });
        }

        const attendance = await Attendance.find({ student: parentDoc.student._id })
            .populate("student", "name email studentclass")
            .sort({ date: -1 });

        res.status(200).json({
            message: "Child attendance retrieved successfully",
            child: parentDoc.student,
            attendance
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAttendanceBystudent = async (req, res) => {
    try {
        const { studentId } = req.params;

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        // Ownership check for Student
        if (req.user && req.user.role === "Student") {
            const isOwn = String(student._id) === String(req.user.id) ||
                          (student.user && String(student.user._id || student.user) === String(req.user.id));
            if (!isOwn) {
                return res.status(403).json({
                    message: "Access denied. You can only view your own attendance."
                });
            }
        }

        // Ownership check for Parent
        if (req.user && req.user.role === "Parent") {
            const parent = await Parent.findOne({
                $or: [{ user: req.user.id }, { email: req.user.email?.toLowerCase() }],
                student: studentId
            });

            if (!parent) {
                return res.status(403).json({
                    message: "Access denied. You can only view your linked child's attendance."
                });
            }
        }

        const attendance = await Attendance.find({
            student: studentId
        })
        .populate("student", "name email studentclass")
        .sort({ date: -1 });

        res.status(200).json({
            message: "Student Attendance By Id",
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
            message: "Student attendance updated successfully",
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
            message: "Attendance deleted successfully",
            attendance
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    Attendancemark,
    getAttendance,
    getMyAttendance,
    getChildAttendance,
    getAttendanceBystudent,
    getupdateAttendance,
    getdeleteByattendance
};