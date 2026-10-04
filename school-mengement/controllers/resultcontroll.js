const Result = require("../models/result");
const Student = require("../models/student");
const Parent = require("../models/Parent");

const calculateGrade = (percentage) => {
    if (percentage >= 90) return "+A";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C";
    if (percentage >= 40) return "D";
    return "F";
};

const createresult = async (req, res) => {
    try {
        const { student, Semester, Subject, totalmarks, obtainedMarks } = req.body;

        if (!student || !Semester || !Subject || totalmarks === undefined || obtainedMarks === undefined) {
            return res.status(400).json({
                message: "Student, Semester, Subject, totalmarks, and obtainedMarks are required"
            });
        }

        const studentExists = await Student.findById(student);
        if (!studentExists) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        const numTotal = Number(totalmarks);
        const numObtained = Number(obtainedMarks);

        if (numObtained > numTotal) {
            return res.status(400).json({
                message: "Obtained marks cannot be greater than total marks"
            });
        }

        const result = await Result.create({
            student,
            Semester: Semester.trim(),
            Subject: Subject.trim(),
            totalmarks: numTotal,
            obtainedMarks: numObtained
        });

        const percentage = Number(((numObtained / (numTotal || 1)) * 100).toFixed(2));
        const grade = calculateGrade(percentage);

        const populatedResult = await Result.findById(result._id)
            .populate("student", "name email studentclass");

        res.status(201).json({
            message: "Student Result Created successfully",
            result: {
                ...populatedResult.toObject(),
                percentage,
                grade
            }
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getAllResults = async (req, res) => {
    try {
        const results = await Result.find()
            .populate("student", "name email studentclass")
            .sort({ createdAt: -1 });

        const formattedResults = results.map((r) => {
            const percentage = Number(((r.obtainedMarks / (r.totalmarks || 1)) * 100).toFixed(2));
            const grade = calculateGrade(percentage);
            return {
                ...r.toObject(),
                percentage,
                grade
            };
        });

        res.status(200).json({
            message: "All Results fetched successfully",
            results: formattedResults
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// GET /api/result/my (Student only)
const getMyResults = async (req, res) => {
    try {
        const studentDoc = await Student.findOne({
            $or: [{ user: req.user.id }, { _id: req.user.id }, { email: req.user.email?.toLowerCase() }]
        });

        if (!studentDoc) {
            return res.status(200).json({
                message: "No student profile found for this account",
                results: []
            });
        }

        const results = await Result.find({ student: studentDoc._id })
            .populate("student", "name email studentclass")
            .sort({ createdAt: -1 });

        const formattedResults = results.map((r) => {
            const percentage = Number(((r.obtainedMarks / (r.totalmarks || 1)) * 100).toFixed(2));
            const grade = calculateGrade(percentage);
            return { ...r.toObject(), percentage, grade };
        });

        res.status(200).json({
            message: "My results fetched successfully",
            student: studentDoc,
            results: formattedResults
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/result/child (Parent only)
const getChildResults = async (req, res) => {
    try {
        const parentDoc = await Parent.findOne({
            $or: [{ user: req.user.id }, { email: req.user.email?.toLowerCase() }]
        }).populate("student", "name email studentclass");

        if (!parentDoc || !parentDoc.student) {
            return res.status(200).json({
                message: "No linked child found for this parent account",
                child: null,
                results: []
            });
        }

        const results = await Result.find({ student: parentDoc.student._id })
            .populate("student", "name email studentclass")
            .sort({ createdAt: -1 });

        const formattedResults = results.map((r) => {
            const percentage = Number(((r.obtainedMarks / (r.totalmarks || 1)) * 100).toFixed(2));
            const grade = calculateGrade(percentage);
            return { ...r.toObject(), percentage, grade };
        });

        res.status(200).json({
            message: "Child results fetched successfully",
            child: parentDoc.student,
            results: formattedResults
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getResults = async (req, res) => {
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
                    message: "Access denied. You can only see your own results."
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
                    message: "Access denied. You can only see your child's results."
                });
            }
        }

        const results = await Result.find({ student: studentId })
            .populate("student", "name email studentclass")
            .sort({ createdAt: -1 });

        const formattedResults = results.map((r) => {
            const percentage = Number(((r.obtainedMarks / (r.totalmarks || 1)) * 100).toFixed(2));
            const grade = calculateGrade(percentage);
            return { ...r.toObject(), percentage, grade };
        });

        res.status(200).json({
            message: "Student results fetched successfully",
            student,
            results: formattedResults
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getResultId = async (req, res) => {
    try {
        const result = await Result.findById(req.params.id)
            .populate("student", "name email studentclass");

        if (!result) {
            return res.status(404).json({
                message: "Result not found"
            });
        }

        // Student ownership check
        if (req.user && req.user.role === "Student") {
            const studentId = result.student?._id;
            const student = await Student.findById(studentId);
            const isOwn = student && (
                String(student._id) === String(req.user.id) ||
                (student.user && String(student.user) === String(req.user.id))
            );
            if (!isOwn) {
                return res.status(403).json({
                    message: "Access denied. You can only see your own result."
                });
            }
        }

        // Parent ownership check
        if (req.user && req.user.role === "Parent") {
            const parent = await Parent.findOne({
                $or: [{ user: req.user.id }, { email: req.user.email?.toLowerCase() }],
                student: result.student?._id
            });
            if (!parent) {
                return res.status(403).json({
                    message: "Access denied. You can only see your child's result."
                });
            }
        }

        const percentage = Number(((result.obtainedMarks / (result.totalmarks || 1)) * 100).toFixed(2));
        const grade = calculateGrade(percentage);

        res.status(200).json({
            message: "Result fetched successfully",
            result: {
                ...result.toObject(),
                percentage,
                grade
            }
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const updateResult = async (req, res) => {
    try {
        const result = await Result.findById(req.params.id);
        if (!result) {
            return res.status(404).json({
                message: "Result not found"
            });
        }

        const { Semester, Subject, totalmarks, obtainedMarks, student } = req.body;

        if (student) {
            const studentExists = await Student.findById(student);
            if (!studentExists) {
                return res.status(404).json({ message: "Student not found" });
            }
            result.student = student;
        }

        if (Semester) result.Semester = Semester.trim();
        if (Subject) result.Subject = Subject.trim();
        if (totalmarks !== undefined) result.totalmarks = Number(totalmarks);
        if (obtainedMarks !== undefined) result.obtainedMarks = Number(obtainedMarks);

        if (result.obtainedMarks > result.totalmarks) {
            return res.status(400).json({
                message: "Obtained marks cannot be greater than total marks"
            });
        }

        await result.save();

        const updatedResult = await Result.findById(result._id)
            .populate("student", "name email studentclass");

        const percentage = Number(((updatedResult.obtainedMarks / (updatedResult.totalmarks || 1)) * 100).toFixed(2));
        const grade = calculateGrade(percentage);

        res.status(200).json({
            message: "Result updated successfully",
            result: {
                ...updatedResult.toObject(),
                percentage,
                grade
            }
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const deleteResult = async (req, res) => {
    try {
        const result = await Result.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({
                message: "Result not found"
            });
        }

        res.status(200).json({
            message: "Result deleted successfully",
            result
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    createresult,
    getAllResults,
    getMyResults,
    getChildResults,
    getResults,
    getResultId,
    updateResult,
    deleteResult
};