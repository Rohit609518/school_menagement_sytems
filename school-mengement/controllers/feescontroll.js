const Fees = require("../models/Fees");
const Student = require("../models/student");
const Parent = require("../models/Parent");

const createfees = async (req, res) => {
    try {
        const { student, totalAmount, paidAmount = 0, paymentMethod } = req.body;

        if (!student || totalAmount === undefined || !paymentMethod) {
            return res.status(400).json({
                message: "Student, totalAmount and paymentMethod are required"
            });
        }

        const studentExists = await Student.findById(student);

        if (!studentExists) {
            return res.status(404).json({
                message: "student not found"
            });
        }

        const numTotal = Number(totalAmount);
        const numPaid = Number(paidAmount);

        if (numPaid > numTotal) {
            return res.status(400).json({
                message: "Paid amount cannot be greater than total amount"
            });
        }

        const remaining = numTotal - numPaid;

        let status;
        if (numTotal === 0 || numPaid === 0) {
            status = "pending";
        } else if (numPaid < numTotal) {
            status = "partial";
        } else {
            status = "paid";
        }

        const fees = await Fees.create({
            student,
            totalAmount: numTotal,
            paidAmount: numPaid,
            paymentMethod,
            status
        });

        const feesResponse = {
            ...fees.toObject(),
            remaining
        };

        res.status(201).json({
            message: "Fees created successfully",
            fees: feesResponse,
            fee: feesResponse
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getFees = async (req, res) => {
    try {
        let filter = {};

        // If user is Student, only show their own fees
        if (req.user && req.user.role === "Student") {
            const studentDoc = await Student.findOne({
                $or: [{ user: req.user.id }, { _id: req.user.id }]
            });
            if (studentDoc) {
                filter.student = studentDoc._id;
            } else {
                return res.status(200).json({
                    message: "Fees fetched successfully",
                    fees: []
                });
            }
        }

        // If user is Parent, only show their child's fees
        if (req.user && req.user.role === "Parent") {
            const parentDoc = await Parent.findOne({ user: req.user.id });
            if (parentDoc) {
                filter.student = parentDoc.student;
            } else {
                return res.status(200).json({
                    message: "Fees fetched successfully",
                    fees: []
                });
            }
        }

        const fees = await Fees.find(filter)
            .populate("student", "name email studentclass")
            .sort({ createdAt: -1 });

        const feesData = fees.map((fee) => {
            const remaining = Math.max(0, (fee.totalAmount || 0) - (fee.paidAmount || 0));

            let status = fee.status;
            if (!status) {
                if (fee.totalAmount === 0 || fee.paidAmount === 0) {
                    status = "pending";
                } else if (fee.paidAmount < fee.totalAmount) {
                    status = "partial";
                } else {
                    status = "paid";
                }
            }

            return {
                _id: fee._id,
                student: fee.student,
                totalAmount: fee.totalAmount,
                paidAmount: fee.paidAmount,
                remaining,
                paymentDate: fee.paymentDate,
                paymentMethod: fee.paymentMethod,
                status,
                createdAt: fee.createdAt
            };
        });

        res.status(200).json({
            message: "Fees fetched successfully",
            fees: feesData
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getFeesId = async (req, res) => {
    try {
        const fees = await Fees.findById(req.params.id)
            .populate("student", "name email studentclass");

        if (!fees) {
            return res.status(404).json({
                message: "fees not found"
            });
        }

        const remaining = Math.max(0, (fees.totalAmount || 0) - (fees.paidAmount || 0));

        let status = fees.status;
        if (!status) {
            if (fees.totalAmount === 0 || fees.paidAmount === 0) {
                status = "pending";
            } else if (fees.paidAmount < fees.totalAmount) {
                status = "partial";
            } else {
                status = "paid";
            }
        }

        const feeData = {
            _id: fees._id,
            student: fees.student,
            totalAmount: fees.totalAmount,
            paidAmount: fees.paidAmount,
            remaining,
            paymentDate: fees.paymentDate,
            paymentMethod: fees.paymentMethod,
            status,
            createdAt: fees.createdAt
        };

        res.status(200).json({
            message: "Fees fetched By ID successfully",
            fee: feeData,
            fees: feeData
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const updateFees = async (req, res) => {
    try {
        const fees = await Fees.findById(req.params.id);

        if (!fees) {
            return res.status(404).json({
                message: "Fees not found"
            });
        }

        if (req.body.student !== undefined) {
            const studentExists = await Student.findById(req.body.student);

            if (!studentExists) {
                return res.status(404).json({
                    message: "student not found"
                });
            }

            fees.student = req.body.student;
        }

        if (req.body.totalAmount !== undefined) {
            fees.totalAmount = Number(req.body.totalAmount);
        }

        if (req.body.paidAmount !== undefined) {
            fees.paidAmount = Number(req.body.paidAmount);
        }

        if (req.body.paymentMethod !== undefined) {
            fees.paymentMethod = req.body.paymentMethod;
        }

        if (fees.paidAmount > fees.totalAmount) {
            return res.status(400).json({
                message: "Paid amount cannot be greater than total amount"
            });
        }

        const remaining = Math.max(0, fees.totalAmount - fees.paidAmount);

        let status;
        if (fees.totalAmount === 0 || fees.paidAmount === 0) {
            status = "pending";
        } else if (fees.paidAmount < fees.totalAmount) {
            status = "partial";
        } else {
            status = "paid";
        }

        fees.status = status;

        await fees.save();

        const updatedFee = {
            _id: fees._id,
            student: fees.student,
            totalAmount: fees.totalAmount,
            paidAmount: fees.paidAmount,
            remaining,
            paymentMethod: fees.paymentMethod,
            status
        };

        res.status(200).json({
            message: "Fees updated successfully",
            fee: updatedFee,
            fees: updatedFee
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const deleteFees = async (req, res) => {
    try {
        const fees = await Fees.findByIdAndDelete(req.params.id);

        if (!fees) {
            return res.status(404).json({
                message: "fees not found"
            });
        }

        res.status(200).json({
            message: "Fees deleted successfully",
            fees
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getFeesByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        // Student can only see their own fees
        if (req.user && req.user.role === "Student") {
            const isOwn = String(student._id) === String(req.user.id) ||
                          (student.user && String(student.user._id || student.user) === String(req.user.id));

            if (!isOwn) {
                return res.status(403).json({
                    message: "You can only view your own fee details"
                });
            }
        }

        // Parent can only see linked child's fees
        if (req.user && req.user.role === "Parent") {
            const parent = await Parent.findOne({
                user: req.user.id,
                student: studentId
            });

            if (!parent) {
                return res.status(403).json({
                    message: "You can only see your child's fee details"
                });
            }
        }

        const fees = await Fees.find({ student: studentId })
            .populate("student", "name email studentclass")
            .sort({ createdAt: -1 });

        const feesData = fees.map((fee) => {
            const remaining = Math.max(0, (fee.totalAmount || 0) - (fee.paidAmount || 0));

            let status = fee.status;
            if (!status) {
                if (fee.totalAmount === 0 || fee.paidAmount === 0) {
                    status = "pending";
                } else if (fee.paidAmount < fee.totalAmount) {
                    status = "partial";
                } else {
                    status = "paid";
                }
            }

            return {
                _id: fee._id,
                student: fee.student,
                totalAmount: fee.totalAmount,
                paidAmount: fee.paidAmount,
                remaining,
                paymentMethod: fee.paymentMethod,
                status,
                createdAt: fee.createdAt
            };
        });

        res.status(200).json({
            message: "Student fees fetched successfully",
            fees: feesData
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    createfees,
    getFees,
    getFeesByStudent,
    getFeesId,
    updateFees,
    deleteFees
};