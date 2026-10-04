const User = require("../models/user");
const Student = require("../models/student");
const Teacher = require("../models/teacher");
const Parent = require("../models/Parent");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_school_system_2026";

const createRgesiter = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashpassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashpassword,
      role: role || "Student"
    });

    if (user.role === "Student") {
      try {
        let existingStudent = await Student.findOne({ email: normalizedEmail });
        if (existingStudent) {
          existingStudent.user = user._id;
          await existingStudent.save();
        } else {
          await Student.create({
            user: user._id,
            name: user.name,
            email: user.email,
            password: hashpassword,
            age: req.body.age || 18,
            gender: req.body.gender || "Male",
            studentclass: req.body.studentclass || "10th"
          });
        }
      } catch (studentErr) {
        console.log("Auto-create student profile note:", studentErr.message);
      }
    } else if (user.role === "Teacher") {
      try {
        let existingTeacher = await Teacher.findOne({ email: normalizedEmail });
        if (existingTeacher) {
          existingTeacher.user = user._id;
          await existingTeacher.save();
        } else if (req.body.subject || req.body.phone) {
          await Teacher.create({
            user: user._id,
            name: user.name,
            email: user.email,
            phone: req.body.phone || "0000000000",
            subject: req.body.subject || "General",
            experience: req.body.experience || 1,
            salary: req.body.salary || 30000
          });
        }
      } catch (teacherErr) {
        console.log("Auto-create teacher profile note:", teacherErr.message);
      }
    }

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      message: error.message
    });
  }
};

const loginuser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    let user = await User.findOne({ email: normalizedEmail });

    // If User record not found, check if this email exists as a Teacher or Student created by Admin/Teacher
    if (!user) {
      const teacher = await Teacher.findOne({ email: normalizedEmail });
      if (teacher) {
        const hashpassword = await bcrypt.hash(password, 12);
        user = await User.create({
          name: teacher.name,
          email: normalizedEmail,
          password: hashpassword,
          role: "Teacher"
        });
        teacher.user = user._id;
        await teacher.save();
        console.log(`✓ Synced teacher User account on login: ${normalizedEmail}`);
      } else {
        const student = await Student.findOne({ email: normalizedEmail });
        if (student) {
          const hashpassword = await bcrypt.hash(password, 12);
          user = await User.create({
            name: student.name,
            email: normalizedEmail,
            password: hashpassword,
            role: "Student"
          });
          student.user = user._id;
          await student.save();
          console.log(`✓ Synced student User account on login: ${normalizedEmail}`);
        } else {
          return res.status(400).json({
            message: "Invalid email or password"
          });
        }
      }
    } else {
      let isPassword = await bcrypt.compare(password, user.password);

      // If password failed, but user is logging in with default passwords (12345678, teacher123, student123), sync password
      if (!isPassword) {
        if (
          (user.role === "Teacher" && (password === "12345678" || password === "teacher123")) ||
          (user.role === "Student" && (password === "12345678" || password === "student123"))
        ) {
          user.password = await bcrypt.hash(password, 12);
          await user.save();
          isPassword = true;
          console.log(`✓ Updated password for ${user.role}: ${normalizedEmail}`);
        }
      }

      if (!isPassword) {
        return res.status(400).json({
          message: "Invalid email or password"
        });
      }
    }

    // Ensure profile is linked for role
    if (user.role === "Student") {
      try {
        let student = await Student.findOne({ user: user._id });
        if (!student) {
          student = await Student.findOne({ email: user.email });
          if (student) {
            if (!student.user) {
              student.user = user._id;
              await student.save();
            }
          } else {
            await Student.create({
              user: user._id,
              name: user.name,
              email: user.email,
              password: user.password,
              age: 18,
              gender: "Male",
              studentclass: "10th"
            });
          }
        }
      } catch (err) {
        console.log("Student sync on login error:", err.message);
      }
    } else if (user.role === "Teacher") {
      try {
        let teacher = await Teacher.findOne({ user: user._id });
        if (!teacher) {
          teacher = await Teacher.findOne({ email: user.email });
          if (teacher && !teacher.user) {
            teacher.user = user._id;
            await teacher.save();
          }
        }
      } catch (err) {
        console.log("Teacher sync on login error:", err.message);
      }
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    res.status(200).json({
      message: "User successfully logged in",
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: error.message
    });
  }
};

const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const adminExists = await User.findOne({ email: normalizedEmail });

    if (adminExists) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashpassword = await bcrypt.hash(password, 12);

    const admin = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashpassword,
      role: "Admin"
    });

    res.status(201).json({
      message: "Admin created successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error("Create Admin error:", error);
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  createRgesiter,
  registerUser: createRgesiter,
  loginuser,
  loginUser: loginuser,
  createAdmin
};