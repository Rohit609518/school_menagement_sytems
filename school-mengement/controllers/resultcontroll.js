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
                message: "student not found"
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
            },
            percentage,
            grade
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getAllResults = async (req, res) => {
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
                    message: "Results fetched successfully",
                    results: [],
                    result: []
                });
            }
        }

        if (req.user && req.user.role === "Parent") {
            const parentDoc = await Parent.findOne({ user: req.user.id });
            if (parentDoc) {
                filter.student = parentDoc.student;
            } else {
                return res.status(200).json({
                    message: "Results fetched successfully",
                    results: [],
                    result: []
                });
            }
        }

        const results = await Result.find(filter)
            .populate("student", "name email studentclass")
            .sort({ Semester: 1, Subject: 1 });

        const resultData = results.map((item) => {
            const total = item.totalmarks || 1;
            const percentage = Number(((item.obtainedMarks / total) * 100).toFixed(2));
            const grade = calculateGrade(percentage);

            return {
                _id: item._id,
                student: item.student,
                Semester: item.Semester,
                Subject: item.Subject,
                totalmarks: item.totalmarks,
                obtainedMarks: item.obtainedMarks,
                percentage,
                grade
            };
        });

        res.status(200).json({
            message: "Results fetched successfully",
            results: resultData,
            result: resultData
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getResults = async (req, res) => {
    try {
        const { studentId } = req.params;

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({
                message: "student not found"
            });
        }

        // Student authorization check
        if (req.user && req.user.role === "Student") {
            const isOwn = String(student._id) === String(req.user.id) ||
                          (student.user && String(student.user) === String(req.user.id));
            if (!isOwn) {
                return res.status(403).json({
                    message: "You can only view your own results"
                });
            }
        }

        // Parent authorization check
        if (req.user && req.user.role === "Parent") {
            const parent = await Parent.findOne({
                user: req.user.id,
                student: studentId
            });
            if (!parent) {
                return res.status(403).json({
                    message: "You can only view your child's results"
                });
            }
        }

        const results = await Result.find({
            student: studentId
        })
        .populate("student", "name email studentclass")
        .sort({ Semester: 1, Subject: 1 });

        const resultData = results.map((item) => {
            const total = item.totalmarks || 1;
            const percentage = Number(((item.obtainedMarks / total) * 100).toFixed(2));
            const grade = calculateGrade(percentage);

            return {
                _id: item._id,
                student: item.student,
                Semester: item.Semester,
                Subject: item.Subject,
                totalmarks: item.totalmarks,
                obtainedMarks: item.obtainedMarks,
                percentage,
                grade
            };
        });

        res.status(200).json({
            message: "Results fetched successfully",
            results: resultData,
            result: resultData
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
                message: "Result not found "
            });
        }

        const total = result.totalmarks || 1;
        const percentage = Number(((result.obtainedMarks / total) * 100).toFixed(2));
        const grade = calculateGrade(percentage);

        const formattedResult = {
            _id: result._id,
            student: result.student,
            Semester: result.Semester,
            Subject: result.Subject,
            totalmarks: result.totalmarks,
            obtainedMarks: result.obtainedMarks,
            percentage,
            grade
        };

        res.status(200).json({
            message: "Result fetched successfully",
            result: formattedResult
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

        // Fixed: Check req.body.student instead of req.params.student!
        if (req.body.student !== undefined) {
            const studentExists = await Student.findById(req.body.student);

            if (!studentExists) {
                return res.status(404).json({
                    message: "Student is not found"
                });
            }

            result.student = req.body.student;
        }

        if (req.body.Semester !== undefined) {
            result.Semester = req.body.Semester;
        }

        if (req.body.Subject !== undefined) {
            result.Subject = req.body.Subject;
        }

        if (req.body.totalmarks !== undefined) {
            result.totalmarks = Number(req.body.totalmarks);
        }

        if (req.body.obtainedMarks !== undefined) {
            result.obtainedMarks = Number(req.body.obtainedMarks);
        }

        if (result.obtainedMarks > result.totalmarks) {
            return res.status(400).json({
                message: "Obtained marks cannot be greater than total marks"
            });
        }

        await result.save();

        const total = result.totalmarks || 1;
        const percentage = Number(((result.obtainedMarks / total) * 100).toFixed(2));
        const grade = calculateGrade(percentage);

        const updated = await Result.findById(result._id)
            .populate("student", "name email studentclass");

        res.status(200).json({
            message: "Result updated successfully",
            result: {
                ...updated.toObject(),
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
    getResults,
    getResultId,
    updateResult,
    deleteResult
};