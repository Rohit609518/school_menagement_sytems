const Exam = require("../models/Exam");
const Student = require("../models/student");
const Parent = require("../models/Parent");

// Create Exam
const createExam = async (req, res) => {
    try {
        const {
            student,
            subject,
            examname,
            examName,
            totalsmark,
            totalMarks,
            obtainedMarks,
            examDate
        } = req.body;

        const resolvedExamname = (examname || examName || "").trim();
        const resolvedTotalsmark = totalsmark !== undefined ? Number(totalsmark) : (totalMarks !== undefined ? Number(totalMarks) : undefined);
        const resolvedObtainedMarks = obtainedMarks !== undefined ? Number(obtainedMarks) : undefined;

        if (!student || !subject || !resolvedExamname || resolvedTotalsmark === undefined || resolvedObtainedMarks === undefined) {
            return res.status(400).json({
                message: "Please provide all required fields: student, subject, exam name, total marks, and obtained marks"
            });
        }

        // Check student exists
        const studentExists = await Student.findById(student);
        if (!studentExists) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        // Check obtained marks
        if (resolvedObtainedMarks > resolvedTotalsmark) {
            return res.status(400).json({
                message: "Obtained marks cannot be greater than total marks"
            });
        }

        // Create exam
        const exam = await Exam.create({
            student,
            subject: subject.trim(),
            examname: resolvedExamname,
            totalsmark: resolvedTotalsmark,
            obtainedMarks: resolvedObtainedMarks,
            examDate: examDate || new Date()
        });

        const total = exam.totalsmark || 1;
        const percentage = Number(((exam.obtainedMarks / total) * 100).toFixed(2));

        const populatedExam = await Exam.findById(exam._id)
            .populate("student", "name email studentclass");

        res.status(201).json({
            message: "Exam created successfully",
            exam: {
                ...populatedExam.toObject(),
                percentage
            }
        });

    } catch (error) {
        console.error("Create exam error:", error);
        res.status(500).json({
            message: error.message
        });
    }
};

// Get all Exams
const getexams = async (req, res) => {
    try {
        const exams = await Exam.find()
            .populate("student", "name email studentclass")
            .sort({ examDate: -1, createdAt: -1 });

        const formattedExams = exams.map((exam) => {
            const total = exam.totalsmark || 1;
            const percentage = Number(((exam.obtainedMarks / total) * 100).toFixed(2));
            return {
                ...exam.toObject(),
                percentage
            };
        });

        res.status(200).json({
            message: "Exams fetched successfully",
            exams: formattedExams
        });

    } catch (error) {
        console.error("Get exams error:", error);
        res.status(500).json({
            message: error.message
        });
    }
};

// GET /api/exams/my (Student only)
const getMyExams = async (req, res) => {
    try {
        const studentDoc = await Student.findOne({
            $or: [{ user: req.user.id }, { _id: req.user.id }, { email: req.user.email?.toLowerCase() }]
        });

        if (!studentDoc) {
            return res.status(200).json({
                message: "No student profile found for this account",
                exams: []
            });
        }

        const exams = await Exam.find({ student: studentDoc._id })
            .populate("student", "name email studentclass")
            .sort({ examDate: -1, createdAt: -1 });

        const formattedExams = exams.map((exam) => {
            const total = exam.totalsmark || 1;
            const percentage = Number(((exam.obtainedMarks / total) * 100).toFixed(2));
            return { ...exam.toObject(), percentage };
        });

        res.status(200).json({
            message: "My exams fetched successfully",
            student: studentDoc,
            exams: formattedExams
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/exams/child (Parent only)
const getChildExams = async (req, res) => {
    try {
        const parentDoc = await Parent.findOne({
            $or: [{ user: req.user.id }, { email: req.user.email?.toLowerCase() }]
        }).populate("student", "name email studentclass");

        if (!parentDoc || !parentDoc.student) {
            return res.status(200).json({
                message: "No linked child found for this parent account",
                child: null,
                exams: []
            });
        }

        const exams = await Exam.find({ student: parentDoc.student._id })
            .populate("student", "name email studentclass")
            .sort({ examDate: -1, createdAt: -1 });

        const formattedExams = exams.map((exam) => {
            const total = exam.totalsmark || 1;
            const percentage = Number(((exam.obtainedMarks / total) * 100).toFixed(2));
            return { ...exam.toObject(), percentage };
        });

        res.status(200).json({
            message: "Child exams fetched successfully",
            child: parentDoc.student,
            exams: formattedExams
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Exams By Student
const getExamsByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        // Student ownership check
        if (req.user && req.user.role === "Student") {
            const isOwn = String(student._id) === String(req.user.id) ||
                          (student.user && String(student.user) === String(req.user.id));
            if (!isOwn) {
                return res.status(403).json({
                    message: "Access denied. You can only see your own exams."
                });
            }
        }

        // Parent ownership check
        if (req.user && req.user.role === "Parent") {
            const parent = await Parent.findOne({
                $or: [{ user: req.user.id }, { email: req.user.email?.toLowerCase() }],
                student: studentId
            });
            if (!parent) {
                return res.status(403).json({
                    message: "Access denied. You can only see your child's exams."
                });
            }
        }

        const exams = await Exam.find({ student: studentId })
            .populate("student", "name email studentclass")
            .sort({ examDate: -1, createdAt: -1 });

        const formattedExams = exams.map((exam) => {
            const total = exam.totalsmark || 1;
            const percentage = Number(((exam.obtainedMarks / total) * 100).toFixed(2));
            return { ...exam.toObject(), percentage };
        });

        res.status(200).json({
            message: "Student exams fetched successfully",
            student,
            exams: formattedExams
        });

    } catch (error) {
        console.error("Get exams by student error:", error);
        res.status(500).json({
            message: error.message
        });
    }
};

// Get Exam By ID
const getExamsId = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id)
            .populate("student", "name email studentclass");

        if (!exam) {
            return res.status(404).json({
                message: "Exam not found"
            });
        }

        // Student ownership check
        if (req.user && req.user.role === "Student") {
            const studentId = exam.student?._id;
            const student = await Student.findById(studentId);
            const isOwn = student && (
                String(student._id) === String(req.user.id) ||
                (student.user && String(student.user) === String(req.user.id))
            );
            if (!isOwn) {
                return res.status(403).json({
                    message: "Access denied. You can only see your own exam."
                });
            }
        }

        // Parent ownership check
        if (req.user && req.user.role === "Parent") {
            const parent = await Parent.findOne({
                $or: [{ user: req.user.id }, { email: req.user.email?.toLowerCase() }],
                student: exam.student?._id
            });
            if (!parent) {
                return res.status(403).json({
                    message: "Access denied. You can only see your child's exam."
                });
            }
        }

        const total = exam.totalsmark || 1;
        const percentage = Number(((exam.obtainedMarks / total) * 100).toFixed(2));

        res.status(200).json({
            message: "Exam fetched successfully",
            exam: {
                ...exam.toObject(),
                percentage
            }
        });

    } catch (error) {
        console.error("Get exam by ID error:", error);
        res.status(500).json({
            message: error.message
        });
    }
};

// Update Exam
const updateExam = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) {
            return res.status(404).json({
                message: "Exam not found"
            });
        }

        const {
            student,
            subject,
            examname,
            examName,
            totalsmark,
            totalMarks,
            obtainedMarks,
            examDate
        } = req.body;

        if (student) {
            const studentExists = await Student.findById(student);
            if (!studentExists) {
                return res.status(404).json({ message: "Student not found" });
            }
            exam.student = student;
        }

        if (subject) exam.subject = subject.trim();
        if (examname || examName) exam.examname = (examname || examName).trim();
        if (totalsmark !== undefined) exam.totalsmark = Number(totalsmark);
        else if (totalMarks !== undefined) exam.totalsmark = Number(totalMarks);
        if (obtainedMarks !== undefined) exam.obtainedMarks = Number(obtainedMarks);
        if (examDate) exam.examDate = examDate;

        if (exam.obtainedMarks > exam.totalsmark) {
            return res.status(400).json({
                message: "Obtained marks cannot be greater than total marks"
            });
        }

        await exam.save();

        const updatedExam = await Exam.findById(exam._id)
            .populate("student", "name email studentclass");

        const total = updatedExam.totalsmark || 1;
        const percentage = Number(((updatedExam.obtainedMarks / total) * 100).toFixed(2));

        res.status(200).json({
            message: "Exam updated successfully",
            exam: {
                ...updatedExam.toObject(),
                percentage
            }
        });

    } catch (error) {
        console.error("Update exam error:", error);
        res.status(500).json({
            message: error.message
        });
    }
};

// Delete Exam
const deleteExam = async (req, res) => {
    try {
        const exam = await Exam.findByIdAndDelete(req.params.id);

        if (!exam) {
            return res.status(404).json({
                message: "Exam not found"
            });
        }

        res.status(200).json({
            message: "Exam deleted successfully",
            exam
        });

    } catch (error) {
        console.error("Delete exam error:", error);
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    createExam,
    getexams,
    getMyExams,
    getChildExams,
    getExamsByStudent,
    getExamsId,
    updateExam,
    deleteExam
};