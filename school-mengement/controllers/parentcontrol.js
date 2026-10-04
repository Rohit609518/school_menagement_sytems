const Parent = require("../models/Parent");
const User = require("../models/user");
const Student = require("../models/student");

const createParent = async (req, res) => {
    try {
        const {
            user,
            name,
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

        // Check User if provided
        let parentUser = null;
        if (user) {
            parentUser = await User.findById(user);
            if (!parentUser) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            if (parentUser.role !== "Parent") {
                return res.status(400).json({
                    message: "User role must be Parent"
                });
            }
        }

        const parentData = {
            name: name.trim(),
            phone: phone.trim(),
            student
        };

        if (user) {
            parentData.user = user;
        }

        // Create Parent
        const parent = await Parent.create(parentData);

        const populatedParent = await Parent.findById(parent._id)
            .populate("user", "name email role")
            .populate("student", "name email studentclass");

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
            .populate("student", "name email studentclass")
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
            .populate("student", "name email studentclass");

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
        .populate("student", "name email studentclass");

        if (!parent) {
            const user = await User.findById(req.user.id);
            if (user) {
                // Try linking if a parent with matching phone or email exists
                parent = await Parent.findOne({
                    $or: [{ name: user.name }]
                })
                .populate("user", "name email role")
                .populate("student", "name email studentclass");

                if (parent && !parent.user) {
                    parent.user = user._id;
                    await parent.save();
                }
            }
        }

        if (!parent) {
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
        .populate("student", "name email studentclass");

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

module.exports = {
    createParent,
    getParents,
    getParentById,
    getMyProfile,
    updateParent,
    deleteParent
};