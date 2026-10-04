const Homework = require("../models/Homework");
const Teacher = require("../models/teacher");
const Student = require("../models/student");
const Parent = require("../models/Parent");

const createHomework = async (req, res) => {
    try {
        const { teacher, student, subject, title, description, duedate, dueDate } = req.body;

        const resolvedDueDate = duedate || dueDate;

        if (!student || !subject || !title || !description || !resolvedDueDate) {
            return res.status(400).json({
                message: "Student, subject, title, description, and dueDate are required"
            });
        }

        // Validate Student exists
        const studentExists = await Student.findById(student);
        if (!studentExists) {
            return res.status(404).json({
                message: "student not found"
            });
        }

        let assignedTeacherId = teacher;

        // Teacher can only create homework for themselves
        if (req.user && req.user.role === "Teacher") {
            let teacherProfile = null;
            if (teacher) {
                teacherProfile = await Teacher.findOne({
                    _id: teacher,
                    user: req.user.id
                });
            }
            if (!teacherProfile) {
                teacherProfile = await Teacher.findOne({
                    user: req.user.id
                });
            }

            if (!teacherProfile) {
                return res.status(403).json({
                    message: "You can only create homework for yourself. Teacher profile not found."
                });
            }

            assignedTeacherId = teacherProfile._id;
        } else {
            // Admin role or others
            if (!assignedTeacherId) {
                return res.status(400).json({
                    message: "Teacher ID is required"
                });
            }
            const teacherExists = await Teacher.findById(assignedTeacherId);
            if (!teacherExists) {
                return res.status(404).json({
                    message: "Teacher not found"
                });
            }
        }

        // Create homework AFTER all validation
        const homework = await Homework.create({
            teacher: assignedTeacherId,
            student,
            subject,
            title,
            description,
            duedate: resolvedDueDate
        });

        const populatedHomework = await Homework.findById(homework._id)
            .populate("teacher", "name email subject")
            .populate("student", "name email studentclass");

        res.status(201).json({
            message: "Homework created successfully",
            homework: populatedHomework
        });
    } catch (error) {
        console.error("Create homework error:", error);
        res.status(500).json({
            message: error.message
        });
    }
};

const gethomework = async (req, res) => {
    try {
        let filter = {};

        // If Teacher, optionally show their own homework
        if (req.user && req.user.role === "Teacher") {
            const teacher = await Teacher.findOne({ user: req.user.id });
            if (teacher) {
                // Return all homework or teacher's homework
                // To allow teacher to manage all their assignments
                filter = { teacher: teacher._id };
            }
        }

        const homework = await Homework.find(filter)
            .populate("teacher", "name email subject")
            .populate("student", "name email studentclass")
            .sort({ duedate: 1 });

        res.status(200).json({
            message: "Homework fetched successfully",
            homework
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const gethomeworkID = async (req, res) => {
    try {
        const homework = await Homework.findById(req.params.id)
            .populate("teacher", "name email subject")
            .populate("student", "name email studentclass");

        if (!homework) {
            return res.status(404).json({
                message: "Homework not found"
            });
        }

        // Student -> only own homework
        if (req.user && req.user.role === "Student") {
            const studentId = homework.student?._id;
            const student = await Student.findById(studentId);
            const isOwn = student && (
                String(student._id) === String(req.user.id) ||
                (student.user && String(student.user) === String(req.user.id))
            );

            if (!isOwn) {
                return res.status(403).json({
                    message: "You can only see your own homework"
                });
            }
        }

        // Parent -> only child's homework
        if (req.user && req.user.role === "Parent") {
            const parent = await Parent.findOne({
                user: req.user.id,
                student: homework.student?._id
            });

            if (!parent) {
                return res.status(403).json({
                    message: "You can only see your child's homework"
                });
            }
        }

        res.status(200).json({
            message: "Homework found successfully",
            homework
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const updateHomework = async (req, res) => {
    try {
        const homework = await Homework.findById(req.params.id);

        if (!homework) {
            return res.status(404).json({
                message: "Homework not found"
            });
        }

        // Teacher can update only their own homework
        if (req.user && req.user.role === "Teacher") {
            const teacher = await Teacher.findOne({
                user: req.user.id
            });

            if (!teacher || String(homework.teacher) !== String(teacher._id)) {
                return res.status(403).json({
                    message: "You can only update your own homework"
                });
            }
        }

        if (req.body.subject !== undefined) {
            homework.subject = req.body.subject;
        }

        if (req.body.title !== undefined) {
            homework.title = req.body.title;
        }

        if (req.body.description !== undefined) {
            homework.description = req.body.description;
        }

        if (req.body.dueDate !== undefined) {
            homework.duedate = req.body.dueDate;
        } else if (req.body.duedate !== undefined) {
            homework.duedate = req.body.duedate;
        }

        if (req.body.teacher !== undefined) {
            const teacherExists = await Teacher.findById(req.body.teacher);

            if (!teacherExists) {
                return res.status(404).json({
                    message: "Teacher not found"
                });
            }

            homework.teacher = req.body.teacher;
        }

        if (req.body.student !== undefined) {
            const studentExists = await Student.findById(req.body.student);

            if (!studentExists) {
                return res.status(404).json({
                    message: "Student not found"
                });
            }

            homework.student = req.body.student;
        }

        await homework.save();

        const updated = await Homework.findById(homework._id)
            .populate("teacher", "name email subject")
            .populate("student", "name email studentclass");

        res.status(200).json({
            message: "Homework updated successfully",
            homework: updated
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const deleteHomework = async (req, res) => {
    try {
        const homework = await Homework.findByIdAndDelete(req.params.id);

        if (!homework) {
            return res.status(404).json({
                message: "Homework not found"
            });
        }

        res.status(200).json({
            message: "Homework deleted successfully",
            homework
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const gethomeworkByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;

        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({
                message: "student not found"
            });
        }

        if (req.user && req.user.role === "Student") {
            const isOwn = String(student._id) === String(req.user.id) ||
                          (student.user && String(student.user) === String(req.user.id));

            if (!isOwn) {
                return res.status(403).json({
                    message: "can see for only your homework"
                });
            }
        }

        if (req.user && req.user.role === "Parent") {
            const ownparent = await Parent.findOne({
                user: req.user.id,
                student: studentId
            });

            if (!ownparent) {
                return res.status(403).json({
                    message: "You can see only your child's data"
                });
            }
        }

        const homework = await Homework.find({
            student: studentId
        })
        .populate("teacher", "name email subject")
        .sort({ duedate: 1, createdAt: -1 });

        res.status(200).json({
            message: "Student homework fetched successfully",
            homework
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    createHomework,
    gethomework,
    gethomeworkID,
    updateHomework,
    deleteHomework,
    gethomeworkByStudent
};