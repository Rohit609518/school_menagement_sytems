const Teacher = require("../models/teacher");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

const createTeacher = async (req, res) => {
    try {
        const {
            user,
            name,
            email,
            phone,
            subject,
            experience,
            salary
        } = req.body;

        console.log("Create teacher body:", req.body);

        if (!name || !email || !phone || !subject) {
            return res.status(400).json({
                message: "Name, email, phone, and subject are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingTeacher = await Teacher.findOne({ email: normalizedEmail });
        if (existingTeacher) {
            return res.status(400).json({
                message: "Teacher with this email already exists"
            });
        }

        // Ensure User account exists for Teacher login
        let teacherUser = null;
        if (user) {
            teacherUser = await User.findById(user);
        }

        if (!teacherUser) {
            teacherUser = await User.findOne({ email: normalizedEmail });
            const teacherPass = req.body.password || "12345678";
            const hashpassword = await bcrypt.hash(teacherPass, 12);

            if (!teacherUser) {
                teacherUser = await User.create({
                    name: name.trim(),
                    email: normalizedEmail,
                    password: hashpassword,
                    role: "Teacher"
                });
                console.log(`✓ Teacher user created: ${normalizedEmail} / ${teacherPass}`);
            } else {
                teacherUser.password = hashpassword;
                teacherUser.role = "Teacher";
                await teacherUser.save();
            }
        }

        const teacherData = {
            user: teacherUser?._id,
            name: name.trim(),
            email: normalizedEmail,
            phone: phone.trim(),
            subject: subject.trim(),
            experience: Number(experience) || 0,
            salary: Number(salary) || 0
        };

        // Create Teacher
        const teachers = await Teacher.create(teacherData);

        res.status(201).json({
            message: "Teacher data create successfully",
            teachers,
            teacher: teachers
        });

    } catch (error) {
        console.error("Create teacher error:", error);
        res.status(500).json({
            message: error.message
        });
    }
};

const getTeacher = async (req, res) => {
    try {
        const teachers = await Teacher.find()
            .populate("user", "name email role")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Teacher find by successfully",
            teachers
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getFindId = async (req, res) => {
    try {
        const teachers = await Teacher.findById(req.params.id).populate("user", "name email role");

        if (!teachers) {
            return res.status(404).json({
                message: "teacher is not found"
            });
        }

        res.status(200).json({
            message: "teacher is find ",
            teachers,
            teacher: teachers
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getUpdate = async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (!updateData.user) {
            delete updateData.user;
        }

        const teachers = await Teacher.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        ).populate("user", "name email role");

        if (!teachers) {
            return res.status(404).json({
                message: "Teacher not found "
            });
        }

        res.status(200).json({
            message: "Teacher is update now ",
            teachers,
            teacher: teachers
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const Deleteteacher = async (req, res) => {
    try {
        const teachers = await Teacher.findByIdAndDelete(req.params.id);

        if (!teachers) {
            return res.status(404).json({
                message: "teacher not found"
            });
        }

        res.status(200).json({
            message: "Teacher delete now",
            teachers,
            teacher: teachers
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getMyProfile = async (req, res) => {
    try {
        console.log("TEACHER USER ID:", req.user.id);
        console.log("TEACHER USER ROLE:", req.user.role);

        let teacher = await Teacher.findOne({
            user: req.user.id
        }).populate("user", "name email role");

        if (!teacher) {
            // Check if teacher profile exists by user's email and link it
            const user = await User.findById(req.user.id);
            if (user) {
                teacher = await Teacher.findOne({ email: user.email }).populate("user", "name email role");
                if (teacher) {
                    if (!teacher.user) {
                        teacher.user = user._id;
                        await teacher.save();
                    }
                }
            }
        }

        if (!teacher) {
            return res.status(404).json({
                message: "Teacher profile not found"
            });
        }

        res.status(200).json({
            message: "Your profile",
            teacher
        });

    } catch (error) {
        console.log("getMyProfile teacher error:", error);

        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    createTeacher,
    getTeacher,
    getFindId,
    getUpdate,
    Deleteteacher,
    getMyProfile
};