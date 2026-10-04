const Student = require("../models/student");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_school_system_2026";

const createstudent = async (req, res) => {
    try {
        const { user, name, email, password, age, gender, studentclass } = req.body;
        console.log("Create student body:", req.body);

        if (!name || !email) {
            return res.status(400).json({
                message: "Name and email are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingStudent = await Student.findOne({ email: normalizedEmail });
        if (existingStudent) {
            return res.status(400).json({
                message: "Student with this email already exists"
            });
        }

        // Ensure User account exists for Student login
        let studentUser = null;
        if (user) {
            studentUser = await User.findById(user);
        }

        if (!studentUser) {
            studentUser = await User.findOne({ email: normalizedEmail });
            if (!studentUser) {
                const defaultStudentPass = password || "student123";
                const hashpassword = await bcrypt.hash(defaultStudentPass, 12);
                studentUser = await User.create({
                    name: (name || "").trim(),
                    email: normalizedEmail,
                    password: hashpassword,
                    role: "Student"
                });
                console.log(`✓ Student user created: ${normalizedEmail} / ${defaultStudentPass}`);
            }
        }

        const studentData = {
            user: studentUser?._id,
            name: (name || studentUser?.name || "").trim(),
            email: normalizedEmail,
            password: password || "student123",
            age: age || 18,
            gender: gender || "Male",
            studentclass: studentclass || "10th"
        };

        const Studentpro = await Student.create(studentData);

        res.status(201).json({
            message: "Student details saved successfully",
            Student: Studentpro,
            student: Studentpro
        });
    } catch (error) {
        console.error("Create student error:", error);
        res.status(500).json({ message: error.message });
    }
};

const getStudent = async (req, res) => {
    try {
        const students = await Student.find()
            .populate("user", "name email role")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "student fetch successfully",
            students
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

const getFindId = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).populate("user", "name email role");

        if (!student) {
            return res.status(404).json({
                message: "student not found"
            });
        }

        // Student can only view their own profile
        if (req.user && req.user.role === "Student") {
            const isOwn = String(student._id) === String(req.user.id) ||
                          (student.user && String(student.user._id || student.user) === String(req.user.id));
            if (!isOwn) {
                return res.status(403).json({
                    message: "Access denied. You can only view your own profile."
                });
            }
        }

        res.status(200).json({
            message: "student findById successfully",
            data: student,
            student
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const updatestudent = async (req, res) => {
    try {
        const updateData = { ...req.body };

        // Do not cast empty user string to ObjectId
        if (!updateData.user) {
            delete updateData.user;
        }

        // Hash password if being updated
        if (updateData.password) {
            const salt = await bcrypt.genSalt(12);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }

        const student = await Student.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        ).populate("user", "name email role");

        if (!student) {
            return res.status(404).json({
                message: "student not found"
            });
        }

        res.status(200).json({
            message: "student update successfully",
            student,
            data: student
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const DeleteStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);

        if (!student) {
            return res.status(404).json({
                message: "student not found"
            });
        }

        res.status(200).json({
            message: "student delete successfully",
            student
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const loginStudent = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const student = await Student.findOne({ email: normalizedEmail }).select("+password");

        if (!student) {
            return res.status(404).json({
                message: "student not found"
            });
        }

        const passwordCorrect = await bcrypt.compare(
            password,
            student.password
        );

        if (!passwordCorrect) {
            return res.status(401).json({
                message: "invalid password"
            });
        }

        const token = jwt.sign(
            {
                id: student._id,
                email: student.email,
                role: "Student"
            },
            JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.status(200).json({
            message: "login successfully",
            token,
            student
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getMyprofile = async (req, res) => {
    try {
        console.log("FETCHING PROFILE FOR USER ID:", req.user?.id);

        // 1. Check by linked user id
        let student = await Student.findOne({
            user: req.user.id
        }).populate("user", "name email role");

        // 2. Check if req.user.id is directly the student document id
        if (!student) {
            student = await Student.findById(req.user.id).populate("user", "name email role");
        }

        // 3. Check User collection
        const user = await User.findById(req.user.id);

        if (user) {
            // Check if student profile exists by email and link it
            if (!student) {
                student = await Student.findOne({ email: user.email }).populate("user", "name email role");
                if (student) {
                    if (!student.user) {
                        student.user = user._id;
                        await student.save();
                    }
                }
            }

            // 4. If student still doesn't exist and user role is Student, auto-create the Student profile
            if (!student && user.role === "Student") {
                student = await Student.create({
                    user: user._id,
                    name: user.name,
                    email: user.email,
                    password: user.password,
                    age: 18,
                    gender: "Male",
                    studentclass: "10th"
                });
                student = await Student.findById(student._id).populate("user", "name email role");
            }
        }

        if (!student) {
            return res.status(404).json({
                message: "Student profile not found"
            });
        }

        res.status(200).json({
            message: "Student profile fetched successfully",
            student
        });

    } catch (error) {
        console.log("getMyprofile error:", error);

        res.status(500).json({
            message: error.message
        });
    }
};

const getFindID = getFindId;

module.exports = {
    createstudent,
    getStudent,
    getFindId,
    updatestudent,
    DeleteStudent,
    loginStudent,
    getMyprofile,
    getFindID
};