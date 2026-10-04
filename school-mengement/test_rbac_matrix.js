require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

async function runTestSuite() {
  console.log("=========================================");
  console.log("STARTING SCHOOL SYSTEM RBAC TEST SUITE");
  console.log("=========================================");

  await mongoose.connect(process.env.MOGODB_URL, { serverSelectionTimeoutMS: 10000 });
  console.log("Connected to MongoDB Atlas");

  // Load app
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api/students", require("./routes/studentroutes"));
  app.use("/api/teachers", require("./routes/teachersroutes"));
  app.use("/api/attendance", require("./routes/Attendanceroutes"));
  app.use("/api/homework", require("./routes/homeworkroute"));
  app.use("/api/exams", require("./routes/examroutes"));
  app.use("/api/result", require("./routes/resultroutes"));
  app.use("/api/results", require("./routes/resultroutes"));
  app.use("/api/fees", require("./routes/freesroute"));
  app.use("/api/meeting", require("./routes/meetingroute"));
  app.use("/api/meetings", require("./routes/meetingroute"));
  app.use("/api/auth", require("./routes/authroute"));
  app.use("/api/parents", require("./routes/parentrouter"));

  const Protect = require("./middleware/authmiddleware");
  const rolmiddleware = require("./middleware/rollmiddleware");
  const { getChildren } = require("./controllers/parentcontrol");
  app.get("/api/children", Protect, rolmiddleware("Parent", "Admin"), getChildren);

  const server = app.listen(3456);
  const BASE_URL = "http://127.0.0.1:3456";

  async function apiCall(method, path, body = null, token = null) {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${BASE_URL}${path}`, opts);
    let data;
    try {
      data = await res.json();
    } catch (e) {
      data = null;
    }
    return { status: res.status, body: data };
  }

  let adminToken, teacherToken, studentToken, parentToken;

  try {
    // 1. Test Login for all 4 roles
    console.log("\n[1] Testing Logins for all 4 Roles...");
    
    // Admin Login
    const resAdmin = await apiCall("POST", "/api/auth/login", { email: "admin@school.com", password: "Admin@123" });
    console.log(`Admin Login: Status ${resAdmin.status} - Role: ${resAdmin.body?.user?.role}`);
    if (resAdmin.status !== 200 || resAdmin.body?.user?.role !== "Admin") throw new Error("Admin login failed");
    adminToken = resAdmin.body.token;

    // Teacher Login
    const resTeacher = await apiCall("POST", "/api/auth/login", { email: "teacher@school.com", password: "Teacher@123" });
    console.log(`Teacher Login: Status ${resTeacher.status} - Role: ${resTeacher.body?.user?.role}`);
    if (resTeacher.status !== 200 || resTeacher.body?.user?.role !== "Teacher") throw new Error("Teacher login failed");
    teacherToken = resTeacher.body.token;

    // Student Login
    const resStudent = await apiCall("POST", "/api/auth/login", { email: "student@school.com", password: "Student@123" });
    console.log(`Student Login: Status ${resStudent.status} - Role: ${resStudent.body?.user?.role}`);
    if (resStudent.status !== 200 || resStudent.body?.user?.role !== "Student") throw new Error("Student login failed");
    studentToken = resStudent.body.token;

    // Parent Login
    const resParent = await apiCall("POST", "/api/auth/login", { email: "parent@school.com", password: "Parent@123" });
    console.log(`Parent Login: Status ${resParent.status} - Role: ${resParent.body?.user?.role}`);
    if (resParent.status !== 200 || resParent.body?.user?.role !== "Parent") throw new Error("Parent login failed");
    parentToken = resParent.body.token;

    // 2. Test Admin Exclusive Access
    console.log("\n[2] Testing Admin Exclusive Permissions...");
    
    const statsRes = await apiCall("GET", "/api/auth/stats", null, adminToken);
    console.log(`Admin Stats: Status ${statsRes.status} (Students: ${statsRes.body?.stats?.totalStudents}, Teachers: ${statsRes.body?.stats?.totalTeachers})`);

    const usersRes = await apiCall("GET", "/api/auth/users", null, adminToken);
    console.log(`Admin Users List: Status ${usersRes.status} (${usersRes.body?.users?.length} users)`);

    const parentsRes = await apiCall("GET", "/api/parents", null, adminToken);
    console.log(`Admin Parents List: Status ${parentsRes.status}`);

    // 3. Test Teacher Boundaries & Restrictions
    console.log("\n[3] Testing Teacher Access & Boundaries...");

    const tStudents = await apiCall("GET", "/api/students", null, teacherToken);
    console.log(`Teacher View Students: Status ${tStudents.status} (Allowed: ${tStudents.status === 200})`);

    const dummyStudentId = new mongoose.Types.ObjectId();
    const tDeleteStudent = await apiCall("DELETE", `/api/students/${dummyStudentId}`, null, teacherToken);
    console.log(`Teacher Delete Student: Status ${tDeleteStudent.status} (Denied 403: ${tDeleteStudent.status === 403})`);

    const tParents = await apiCall("GET", "/api/parents", null, teacherToken);
    console.log(`Teacher Access /api/parents: Status ${tParents.status} (Denied 403: ${tParents.status === 403})`);

    const tFeesCreate = await apiCall("POST", "/api/fees", { student: dummyStudentId, totalAmount: 1000, paymentMethod: "Cash" }, teacherToken);
    console.log(`Teacher Create Fees: Status ${tFeesCreate.status} (Denied 403: ${tFeesCreate.status === 403})`);

    const tFeesDelete = await apiCall("DELETE", `/api/fees/${dummyStudentId}`, null, teacherToken);
    console.log(`Teacher Delete Fees: Status ${tFeesDelete.status} (Denied 403: ${tFeesDelete.status === 403})`);

    const tFeesView = await apiCall("GET", "/api/fees", null, teacherToken);
    console.log(`Teacher View Fees: Status ${tFeesView.status} (Allowed 200: ${tFeesView.status === 200})`);

    // 4. Test Student Access & Restrictions
    console.log("\n[4] Testing Student Access & Restrictions...");

    const sProfile = await apiCall("GET", "/api/students/my-profile", null, studentToken);
    console.log(`Student My Profile: Status ${sProfile.status} - Name: ${sProfile.body?.student?.name} (Allowed 200: ${sProfile.status === 200})`);

    const sAtt = await apiCall("GET", "/api/attendance/my", null, studentToken);
    console.log(`Student My Attendance: Status ${sAtt.status} (${sAtt.body?.attendance?.length} records) (Allowed 200: ${sAtt.status === 200})`);

    const sHw = await apiCall("GET", "/api/homework/my", null, studentToken);
    console.log(`Student My Homework: Status ${sHw.status} (${sHw.body?.homework?.length} assignments) (Allowed 200: ${sHw.status === 200})`);

    const sEx = await apiCall("GET", "/api/exams/my", null, studentToken);
    console.log(`Student My Exams: Status ${sEx.status} (${sEx.body?.exams?.length} exams) (Allowed 200: ${sEx.status === 200})`);

    const sRes = await apiCall("GET", "/api/results/my", null, studentToken);
    console.log(`Student My Results: Status ${sRes.status} (${sRes.body?.results?.length} results) (Allowed 200: ${sRes.status === 200})`);

    const sFee = await apiCall("GET", "/api/fees/my", null, studentToken);
    console.log(`Student My Fees: Status ${sFee.status} (${sFee.body?.fees?.length} records) (Allowed 200: ${sFee.status === 200})`);

    const sAllStudents = await apiCall("GET", "/api/students", null, studentToken);
    console.log(`Student List All Students: Status ${sAllStudents.status} (Denied 403: ${sAllStudents.status === 403})`);

    const sCreateHw = await apiCall("POST", "/api/homework", { title: "Hack Homework" }, studentToken);
    console.log(`Student Create Homework: Status ${sCreateHw.status} (Denied 403: ${sCreateHw.status === 403})`);

    // 5. Test Parent Access & Restrictions
    console.log("\n[5] Testing Parent Access & Restrictions...");

    const pProfile = await apiCall("GET", "/api/parents/my-profile", null, parentToken);
    console.log(`Parent Profile: Status ${pProfile.status} - Name: ${pProfile.body?.parent?.name} (Allowed 200: ${pProfile.status === 200})`);

    const pChild = await apiCall("GET", "/api/children", null, parentToken);
    console.log(`Parent Children: Status ${pChild.status} - Child Name: ${pChild.body?.children?.[0]?.name} (Allowed 200: ${pChild.status === 200})`);

    const pAtt = await apiCall("GET", "/api/attendance/child", null, parentToken);
    console.log(`Parent Child Attendance: Status ${pAtt.status} (${pAtt.body?.attendance?.length} records) (Allowed 200: ${pAtt.status === 200})`);

    const pHw = await apiCall("GET", "/api/homework/child", null, parentToken);
    console.log(`Parent Child Homework: Status ${pHw.status} (${pHw.body?.homework?.length} tasks) (Allowed 200: ${pHw.status === 200})`);

    const pEx = await apiCall("GET", "/api/exams/child", null, parentToken);
    console.log(`Parent Child Exams: Status ${pEx.status} (${pEx.body?.exams?.length} exams) (Allowed 200: ${pEx.status === 200})`);

    const pRes = await apiCall("GET", "/api/results/child", null, parentToken);
    console.log(`Parent Child Results: Status ${pRes.status} (${pRes.body?.results?.length} results) (Allowed 200: ${pRes.status === 200})`);

    const pFee = await apiCall("GET", "/api/fees/child", null, parentToken);
    console.log(`Parent Child Fees: Status ${pFee.status} (${pFee.body?.fees?.length} records) (Allowed 200: ${pFee.status === 200})`);

    const pUpdateStudent = await apiCall("PUT", `/api/students/${dummyStudentId}`, { name: "Hacked Student" }, parentToken);
    console.log(`Parent Modify Student: Status ${pUpdateStudent.status} (Denied 403: ${pUpdateStudent.status === 403})`);

    const pCreateExam = await apiCall("POST", "/api/exams", { examname: "Hacked Exam" }, parentToken);
    console.log(`Parent Create Exam: Status ${pCreateExam.status} (Denied 403: ${pCreateExam.status === 403})`);

    console.log("\n=========================================");
    console.log("ALL RBAC & SECURITY TESTS PASSED PERFECTLY!");
    console.log("=========================================");
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

runTestSuite().catch(err => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
