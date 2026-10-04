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
        res.status(500).json({
            message: error.message
        });
    }
};

const getexams = async (req, res) => {
    try {
        let filter = {};

        if (req.user && req.user.role === "Student") {
            const studentDoc = await Student.findOne({
                $or: [{ user: req.user.id }, { _id: req.user.id }]
            });
            if (studentDoc) {
                filter.student = studentDoc._id;
            } else {
                return res.status(200).json({
                    message: "Student weekly test here",
                    exams: []
                });
            }
        }

        if (req.user && req.user.role === "Parent") {
            const parentDoc = await Parent.findOne({ user: req.user.id });
            if (parentDoc) {
                filter.student = parentDoc.student;
            } else {
                return res.status(200).json({
                    message: "Student weekly test here",
                    exams: []
                });
            }
        }

        const exams = await Exam.find(filter)
            .populate("student", "name email studentclass")
            .sort({ examDate: -1, createdAt: -1 });

        const examsData = exams.map((exam) => {
            const total = exam.totalsmark || exam.totalMarks || 1;
            const percentage = (exam.obtainedMarks / total) * 100;

            return {
                _id: exam._id,
                student: exam.student,
                subject: exam.subject,
                examname: exam.examname || exam.examName,
                examName: exam.examname || exam.examName,
                totalsmark: exam.totalsmark || exam.totalMarks,
                totalMarks: exam.totalsmark || exam.totalMarks,
                obtainedMarks: exam.obtainedMarks,
                percentage: Number(percentage.toFixed(2)),
                examDate: exam.examDate
            };
        });

        res.status(200).json({
            message: "Student weekly test here",
            exams: examsData
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Get exams by student ID
const getExamsByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;

        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        // Student can see only own exams
        if (req.user && req.user.role === "Student") {
            const isOwn = String(student._id) === String(req.user.id) ||
                          (student.user && String(student.user) === String(req.user.id));

            if (!isOwn) {
                return res.status(403).json({
                    message: "You can only view your own exams"
                });
            }
        }

        // Parent can see only linked child's exams
        if (req.user && req.user.role === "Parent") {
            const parent = await Parent.findOne({
                user: req.user.id,
                student: studentId
            });

            if (!parent) {
                return res.status(403).json({
                    message: "You can only see your child's exams"
                });
            }
        }

        const exams = await Exam.find({ student: studentId })
            .populate("student", "name email studentclass")
            .sort({ examDate: -1, createdAt: -1 });

        const examsData = exams.map((exam) => {
            const total = exam.totalsmark || exam.totalMarks || 1;
            const percentage = (exam.obtainedMarks / total) * 100;

            return {
                _id: exam._id,
                student: exam.student,
                subject: exam.subject,
                examname: exam.examname || exam.examName,
                examName: exam.examname || exam.examName,
                totalsmark: exam.totalsmark || exam.totalMarks,
                totalMarks: exam.totalsmark || exam.totalMarks,
                obtainedMarks: exam.obtainedMarks,
                percentage: Number(percentage.toFixed(2)),
                examDate: exam.examDate
            };
        });

        res.status(200).json({
            message: "Student exams fetched successfully",
            exams: examsData
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getExamsId = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id).populate("student", "name email studentclass");

        if (!exam) {
            return res.status(404).json({
                message: "Exam not found"
            });
        }

        const total = exam.totalsmark || exam.totalMarks || 1;
        const percentage = (exam.obtainedMarks / total) * 100;

        res.status(200).json({
            message: "Exam fetched successfully",
            exam: {
                _id: exam._id,
                student: exam.student,
                subject: exam.subject,
                examname: exam.examname || exam.examName,
                examName: exam.examname || exam.examName,
                totalsmark: exam.totalsmark || exam.totalMarks,
                totalMarks: exam.totalsmark || exam.totalMarks,
                obtainedMarks: exam.obtainedMarks,
                percentage: Number(percentage.toFixed(2)),
                examDate: exam.examDate
            }
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const updateExam = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);

        if (!exam) {
            return res.status(404).json({
                message: "Exam not found"
            });
        }

        // Update student
        if (req.body.student !== undefined) {
            const studentExists = await Student.findById(req.body.student);

            if (!studentExists) {
                return res.status(404).json({
                    message: "Student not found"
                });
            }

            exam.student = req.body.student;
        }

        // Update subject
        if (req.body.subject !== undefined) {
            exam.subject = req.body.subject;
        }

        // Update exam name
        if (req.body.examname !== undefined) {
            exam.examname = req.body.examname;
        } else if (req.body.examName !== undefined) {
            exam.examname = req.body.examName;
        }

        // Update total marks
        if (req.body.totalsmark !== undefined) {
            exam.totalsmark = Number(req.body.totalsmark);
        } else if (req.body.totalMarks !== undefined) {
            exam.totalsmark = Number(req.body.totalMarks);
        }

        // Update obtained marks
        if (req.body.obtainedMarks !== undefined) {
            exam.obtainedMarks = Number(req.body.obtainedMarks);
        }

        // Check marks
        if (exam.obtainedMarks > exam.totalsmark) {
            return res.status(400).json({
                message: "Obtained marks cannot be greater than total marks"
            });
        }

        // Update exam date
        if (req.body.examDate !== undefined) {
            exam.examDate = req.body.examDate;
        }

        await exam.save();

        const total = exam.totalsmark || 1;
        const percentage = Number(((exam.obtainedMarks / total) * 100).toFixed(2));

        const updated = await Exam.findById(exam._id).populate("student", "name email studentclass");

        res.status(200).json({
            message: "Exam updated successfully",
            exam: {
                ...updated.toObject(),
                percentage
            }
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

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
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    createExam,
    getexams,
    getExamsByStudent,
    getExamsId,
    updateExam,
    deleteExam
};