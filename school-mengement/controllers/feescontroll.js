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
                message: "Student not found"
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

        const populated = await Fees.findById(fees._id).populate("student", "name email studentclass");

        const feesResponse = {
            ...populated.toObject(),
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
        const fees = await Fees.find()
            .populate("student", "name email studentclass")
            .sort({ createdAt: -1 });

        const feesList = fees.map((f) => {
            const remaining = Math.max(0, (f.totalAmount || 0) - (f.paidAmount || 0));
            return {
                ...f.toObject(),
                remaining
            };
        });

        res.status(200).json({
            message: "Fees fetched successfully",
            fees: feesList
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// GET /api/fees/my (Student only)
const getMyFees = async (req, res) => {
    try {
        const studentDoc = await Student.findOne({
            $or: [{ user: req.user.id }, { _id: req.user.id }, { email: req.user.email?.toLowerCase() }]
        });

        if (!studentDoc) {
            return res.status(200).json({
                message: "No student profile found for this account",
                fees: []
            });
        }

        const fees = await Fees.find({ student: studentDoc._id })
            .populate("student", "name email studentclass")
            .sort({ createdAt: -1 });

        const feesList = fees.map((f) => {
            const remaining = Math.max(0, (f.totalAmount || 0) - (f.paidAmount || 0));
            return { ...f.toObject(), remaining };
        });

        res.status(200).json({
            message: "My fees fetched successfully",
            student: studentDoc,
            fees: feesList
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/fees/child (Parent only)
const getChildFees = async (req, res) => {
    try {
        const parentDoc = await Parent.findOne({
            $or: [{ user: req.user.id }, { email: req.user.email?.toLowerCase() }]
        }).populate("student", "name email studentclass");

        if (!parentDoc || !parentDoc.student) {
            return res.status(200).json({
                message: "No linked child found for this parent account",
                child: null,
                fees: []
            });
        }

        const fees = await Fees.find({ student: parentDoc.student._id })
            .populate("student", "name email studentclass")
            .sort({ createdAt: -1 });

        const feesList = fees.map((f) => {
            const remaining = Math.max(0, (f.totalAmount || 0) - (f.paidAmount || 0));
            return { ...f.toObject(), remaining };
        });

        res.status(200).json({
            message: "Child fees fetched successfully",
            child: parentDoc.student,
            fees: feesList
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
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

        // Student ownership check
        if (req.user && req.user.role === "Student") {
            const isOwn = String(student._id) === String(req.user.id) ||
                          (student.user && String(student.user) === String(req.user.id));
            if (!isOwn) {
                return res.status(403).json({
                    message: "Access denied. You can only view your own fees."
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
                    message: "Access denied. You can only view your child's fees."
                });
            }
        }

        const fees = await Fees.find({ student: studentId })
            .populate("student", "name email studentclass")
            .sort({ createdAt: -1 });

        const feesList = fees.map((f) => {
            const remaining = Math.max(0, (f.totalAmount || 0) - (f.paidAmount || 0));
            return { ...f.toObject(), remaining };
        });

        res.status(200).json({
            message: "Student fees fetched successfully",
            student,
            fees: feesList
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getFeesId = async (req, res) => {
    try {
        const fee = await Fees.findById(req.params.id)
            .populate("student", "name email studentclass");

        if (!fee) {
            return res.status(404).json({
                message: "Fee record not found"
            });
        }

        // Student ownership check
        if (req.user && req.user.role === "Student") {
            const studentId = fee.student?._id;
            const student = await Student.findById(studentId);
            const isOwn = student && (
                String(student._id) === String(req.user.id) ||
                (student.user && String(student.user) === String(req.user.id))
            );
            if (!isOwn) {
                return res.status(403).json({
                    message: "Access denied. You can only view your own fees."
                });
            }
        }

        // Parent ownership check
        if (req.user && req.user.role === "Parent") {
            const parent = await Parent.findOne({
                $or: [{ user: req.user.id }, { email: req.user.email?.toLowerCase() }],
                student: fee.student?._id
            });
            if (!parent) {
                return res.status(403).json({
                    message: "Access denied. You can only view your child's fees."
                });
            }
        }

        const remaining = Math.max(0, (fee.totalAmount || 0) - (fee.paidAmount || 0));

        res.status(200).json({
            message: "Fee record fetched successfully",
            fee: {
                ...fee.toObject(),
                remaining
            }
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const updateFees = async (req, res) => {
    try {
        const fee = await Fees.findById(req.params.id);
        if (!fee) {
            return res.status(404).json({
                message: "Fee record not found"
            });
        }

        const { totalAmount, paidAmount, paymentMethod, status } = req.body;

        if (totalAmount !== undefined) fee.totalAmount = Number(totalAmount);
        if (paidAmount !== undefined) fee.paidAmount = Number(paidAmount);
        if (paymentMethod !== undefined) fee.paymentMethod = paymentMethod;

        if (fee.paidAmount > fee.totalAmount) {
            return res.status(400).json({
                message: "Paid amount cannot be greater than total amount"
            });
        }

        if (status !== undefined) {
            fee.status = status;
        } else {
            if (fee.paidAmount === 0) fee.status = "pending";
            else if (fee.paidAmount < fee.totalAmount) fee.status = "partial";
            else fee.status = "paid";
        }

        await fee.save();

        const updatedFee = await Fees.findById(fee._id)
            .populate("student", "name email studentclass");

        const remaining = Math.max(0, (updatedFee.totalAmount || 0) - (updatedFee.paidAmount || 0));

        res.status(200).json({
            message: "Fees updated successfully",
            fee: {
                ...updatedFee.toObject(),
                remaining
            }
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const deleteFees = async (req, res) => {
    try {
        const fee = await Fees.findByIdAndDelete(req.params.id);
        if (!fee) {
            return res.status(404).json({
                message: "Fee record not found"
            });
        }

        res.status(200).json({
            message: "Fees deleted successfully",
            fee
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
    getMyFees,
    getChildFees,
    getFeesByStudent,
    getFeesId,
    updateFees,
    deleteFees
};