const Meeting = require("../models/meeting");
const Student = require("../models/student");
const Teacher = require("../models/teacher");
const Parent = require("../models/Parent");

const createMeeting = async (req, res) => {
    try {
        const {
            student,
            teacher,
            parentName,
            meetingDate,
            meetingTime,
            reson,
            reason,
            remarks = "",
            status = "Scheduled"
        } = req.body;

        const resolvedReason = (reason || reson || "").trim();

        if (!student || !teacher || !parentName || !meetingDate || !meetingTime || !resolvedReason) {
            return res.status(400).json({
                message: "Student, teacher, parentName, meetingDate, meetingTime, and reason are required"
            });
        }

        const studentExists = await Student.findById(student);
        if (!studentExists) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        const teacherExists = await Teacher.findById(teacher);
        if (!teacherExists) {
            return res.status(404).json({
                message: "Teacher not found"
            });
        }

        const meeting = await Meeting.create({
            student,
            teacher,
            parentName: parentName.trim(),
            meetingDate,
            meetingTime,
            reson: resolvedReason,
            remarks,
            status
        });

        const populatedMeeting = await Meeting.findById(meeting._id)
            .populate("student", "name email studentclass")
            .populate("teacher", "name email subject");

        res.status(201).json({
            message: "Parent meeting scheduled successfully",
            meeting: populatedMeeting
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getMeeting = async (req, res) => {
    try {
        let filter = {};

        // Role-based filtering
        if (req.user && req.user.role === "Student") {
            const studentDoc = await Student.findOne({
                $or: [{ user: req.user.id }, { _id: req.user.id }]
            });
            if (studentDoc) {
                filter.student = studentDoc._id;
            } else {
                return res.status(200).json({
                    message: "Meetings fetched successfully",
                    meeting: []
                });
            }
        } else if (req.user && req.user.role === "Parent") {
            const parentDoc = await Parent.findOne({ user: req.user.id });
            if (parentDoc) {
                filter.student = parentDoc.student;
            } else {
                return res.status(200).json({
                    message: "Meetings fetched successfully",
                    meeting: []
                });
            }
        } else if (req.user && req.user.role === "Teacher") {
            const teacherDoc = await Teacher.findOne({ user: req.user.id });
            if (teacherDoc) {
                filter.teacher = teacherDoc._id;
            }
        }

        const meetings = await Meeting.find(filter)
            .populate("student", "name email studentclass")
            .populate("teacher", "name email subject")
            .sort({ meetingDate: 1 });

        res.status(200).json({
            message: "Meetings fetched successfully",
            meeting: meetings,
            meetings
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getMeetingById = async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id)
            .populate("student", "name email studentclass")
            .populate("teacher", "name email subject");

        if (!meeting) {
            return res.status(404).json({
                message: "Meeting not found"
            });
        }

        res.status(200).json({
            message: "Meetings fetched By ID successfully",
            meeting
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getMeetingUpdate = async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id);

        if (!meeting) {
            return res.status(404).json({
                message: "Meeting not found"
            });
        }

        // Validate and update student if provided
        if (req.body.student !== undefined) {
            const studentExists = await Student.findById(req.body.student);
            if (!studentExists) {
                return res.status(404).json({
                    message: "Student not found"
                });
            }
            meeting.student = req.body.student;
        }

        // Validate and update teacher if provided
        if (req.body.teacher !== undefined) {
            const teacherExists = await Teacher.findById(req.body.teacher);
            if (!teacherExists) {
                return res.status(404).json({
                    message: "Teacher not found"
                });
            }
            meeting.teacher = req.body.teacher;
        }

        if (req.body.parentName !== undefined) {
            meeting.parentName = req.body.parentName.trim();
        }

        if (req.body.meetingDate !== undefined) {
            meeting.meetingDate = req.body.meetingDate;
        }

        if (req.body.meetingTime !== undefined) {
            meeting.meetingTime = req.body.meetingTime;
        }

        if (req.body.reason !== undefined) {
            meeting.reson = req.body.reason.trim();
        } else if (req.body.reson !== undefined) {
            meeting.reson = req.body.reson.trim();
        }

        if (req.body.remarks !== undefined) {
            meeting.remarks = req.body.remarks;
        }

        if (req.body.status !== undefined) {
            meeting.status = req.body.status;
        }

        await meeting.save();

        const updatedMeeting = await Meeting.findById(req.params.id)
            .populate("student", "name email studentclass")
            .populate("teacher", "name email subject");

        res.status(200).json({
            message: "Meeting successfully updated",
            meeting: updatedMeeting
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const deleteMeeting = async (req, res) => {
    try {
        const meeting = await Meeting.findByIdAndDelete(req.params.id);

        if (!meeting) {
            return res.status(404).json({
                message: "Meeting not found"
            });
        }

        res.status(200).json({
            message: "Meeting deleted successfully",
            meeting
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    createMeeting,
    getMeeting,
    getMeetingById,
    getMeetingUpdate,
    deleteMeeting
};