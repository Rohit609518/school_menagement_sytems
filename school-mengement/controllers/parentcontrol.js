const Parent = require("../models/Parent");
const User = require("../models/user");
const Student = require("../models/student");
const bcrypt = require("bcryptjs");

const createParent = async (req, res) => {
    try {
        const {
            user,
            name,
            email,
            password,
            phone,
            student
        } = req.body;

        if (!name || !phone || !student) {
            return res.status(400).json({
                message: "Name, phone, and student are required"
            });
        }

        // Check Student exists
        const studentExists = await Student.findById(student);
        if (!studentExists) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        let parentUser = null;
        if (user) {
            parentUser = await User.findById(user);
        }

        // If email provided, create or link User account with Parent role
        if (!parentUser && email) {
            const normalizedEmail = email.trim().toLowerCase();
            parentUser = await User.findOne({ email: normalizedEmail });

            if (!parentUser) {
                const defaultPass = password || "Parent@123";
                const hashpassword = await bcrypt.hash(defaultPass, 12);
                parentUser = await User.create({
                    name: name.trim(),
                    email: normalizedEmail,
                    password: hashpassword,
                    role: "Parent"
                });
                console.log(`✓ Parent user created: ${normalizedEmail}`);
            } else if (parentUser.role !== "Parent") {
                parentUser.role = "Parent";
                await parentUser.save();
            }
        }

        const parentData = {
            name: name.trim(),
            phone: phone.trim(),
            student
        };

        if (email) {
            parentData.email = email.trim().toLowerCase();
        }

        if (parentUser) {
            parentData.user = parentUser._id;
        }

        // Create Parent
        const parent = await Parent.create(parentData);

        const populatedParent = await Parent.findById(parent._id)
            .populate("user", "name email role")
            .populate("student", "name email studentclass age gender");

        res.status(201).json({
            message: "Parent created successfully",
            parent: populatedParent
        });

    } catch (error) {
        console.error("Create parent error:", error);
        res.status(500).json({
            message: error.message
        });
    }
};

const getParents = async (req, res) => {
    try {
        const parents = await Parent.find()
            .populate("user", "name email role")
            .populate("student", "name email studentclass age gender")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Parents fetched successfully",
            parents
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getParentById = async (req, res) => {
    try {
        const parent = await Parent.findById(req.params.id)
            .populate("user", "name email role")
            .populate("student", "name email studentclass age gender");

        if (!parent) {
            return res.status(404).json({
                message: "Parent not found"
            });
        }

        res.status(200).json({
            message: "Parent fetched successfully",
            parent
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getMyProfile = async (req, res) => {
    try {
        let parent = await Parent.findOne({
            user: req.user.id
        })
        .populate("user", "name email role")
        .populate("student", "name email studentclass age gender");

        if (!parent && req.user.email) {
            parent = await Parent.findOne({
                email: req.user.email.toLowerCase()
            })
            .populate("user", "name email role")
            .populate("student", "name email studentclass age gender");

            if (parent && !parent.user) {
                parent.user = req.user.id;
                await parent.save();
            }
        }

        if (!parent) {
            const user = await User.findById(req.user.id);
            if (user) {
                parent = await Parent.findOne({
                    name: user.name
                })
                .populate("user", "name email role")
                .populate("student", "name email studentclass age gender");

                if (parent && !parent.user) {
                    parent.user = user._id;
                    await parent.save();
                }
            }
        }

        if (!parent) {
            if (req.user && req.user.role === "Admin") {
                const user = await User.findById(req.user.id);
                return res.status(200).json({
                    message: "Admin parent profile",
                    parent: {
                        name: user?.name || "Administrator",
                        phone: "N/A"
                    }
                });
            }

            return res.status(404).json({
                message: "Parent profile not found"
            });
        }

        res.status(200).json({
            message: "Parent profile",
            parent
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// GET linked children for parent
const getChildren = async (req, res) => {
    try {
        let parent = await Parent.findOne({
            $or: [{ user: req.user.id }, { email: req.user.email?.toLowerCase() }]
        }).populate("student", "name email studentclass age gender");

        if (!parent) {
            return res.status(404).json({
                message: "Parent profile not found"
            });
        }

        if (!parent.student) {
            return res.status(200).json({
                message: "No child linked to this parent account",
                children: [],
                child: null
            });
        }

        res.status(200).json({
            message: "Linked child fetched successfully",
            children: [parent.student],
            child: parent.student
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const updateParent = async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (!updateData.user) {
            delete updateData.user;
        }

        if (updateData.student) {
            const studentExists = await Student.findById(updateData.student);
            if (!studentExists) {
                return res.status(404).json({
                    message: "Student not found"
                });
            }
        }

        const parent = await Parent.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        )
        .populate("user", "name email role")
        .populate("student", "name email studentclass age gender");

        if (!parent) {
            return res.status(404).json({
                message: "Parent not found"
            });
        }

        res.status(200).json({
            message: "Parent updated successfully",
            parent
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const deleteParent = async (req, res) => {
    try {
        const parent = await Parent.findByIdAndDelete(req.params.id);

        if (!parent) {
            return res.status(404).json({
                message: "Parent not found"
            });
        }

        res.status(200).json({
            message: "Parent deleted successfully",
            parent
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const assignStudentToParent = async (req, res) => {
    try {
        const { studentId } = req.body;
        if (!studentId) {
            return res.status(400).json({ message: "studentId is required" });
        }

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const parent = await Parent.findByIdAndUpdate(
            req.params.id,
            { student: studentId },
            { new: true }
        ).populate("student", "name email studentclass age gender");

        if (!parent) {
            return res.status(404).json({ message: "Parent not found" });
        }

        res.status(200).json({
            message: "Student assigned to parent successfully",
            parent
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createParent,
    getParents,
    getParentById,
    getMyProfile,
    getChildren,
    updateParent,
    deleteParent,
    assignStudentToParent
};