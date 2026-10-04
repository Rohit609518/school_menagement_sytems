import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/login";
import ProtectedRoute from "./routes/ProtectRouter";

// Admin Portal Pages
import AdminDashboard from "./pages/admin/AdminDesbrod";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminTeachers from "./pages/admin/AdminTeachers";
import AdminParents from "./pages/admin/AdminParents";
import AdminFees from "./pages/admin/AdminFees";

// Teacher Portal Pages
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherStudents from "./pages/teacher/TeacherStudents";
import TeacherAttendance from "./pages/teacher/TeacherAttendance";
import TeacherHomework from "./pages/teacher/TeacherHomework";
import TeacherExams from "./pages/teacher/TeacherExams";
import TeacherResults from "./pages/teacher/TeacherResults";
import TeacherFees from "./pages/teacher/TeacherFees";
import TeacherMeetings from "./pages/teacher/TeacherMeetings";

// Student Portal Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentDetails from "./pages/student/StudentDetails";
import Attendance from "./pages/student/Attendance";
import Homework from "./pages/student/Homework";
import Exams from "./pages/student/Exams";
import Results from "./pages/student/Results";
import Fees from "./pages/student/Fees";

// Parent Portal Pages
import ParentDashboard from "./pages/parent/ParentDashboard";
import ParentAttendance from "./pages/parent/ParentAttendance";
import ParentHomework from "./pages/parent/ParentHomework";
import ParentExams from "./pages/parent/ParentExams";
import ParentFees from "./pages/parent/ParentFees";
import ParentMeetings from "./pages/parent/ParentMeetings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication */}
        <Route path="/" element={<Login />} />

        {/* 1. ADMIN PORTAL (Admin ONLY access) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/teachers"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminTeachers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/parents"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminParents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/fees"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminFees />
            </ProtectedRoute>
          }
        />

        {/* 2. TEACHER PORTAL (Teacher & Admin access) */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={["Teacher", "Admin"]}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/students"
          element={
            <ProtectedRoute allowedRoles={["Teacher", "Admin"]}>
              <TeacherStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/attendance"
          element={
            <ProtectedRoute allowedRoles={["Teacher", "Admin"]}>
              <TeacherAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/homework"
          element={
            <ProtectedRoute allowedRoles={["Teacher", "Admin"]}>
              <TeacherHomework />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/exams"
          element={
            <ProtectedRoute allowedRoles={["Teacher", "Admin"]}>
              <TeacherExams />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/results"
          element={
            <ProtectedRoute allowedRoles={["Teacher", "Admin"]}>
              <TeacherResults />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/fees"
          element={
            <ProtectedRoute allowedRoles={["Teacher", "Admin"]}>
              <TeacherFees />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/meetings"
          element={
            <ProtectedRoute allowedRoles={["Teacher", "Admin"]}>
              <TeacherMeetings />
            </ProtectedRoute>
          }
        />

        {/* 3. STUDENT PORTAL (Student & Admin access) */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["Student", "Admin"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/details"
          element={
            <ProtectedRoute allowedRoles={["Student", "Admin"]}>
              <StudentDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/attendance"
          element={
            <ProtectedRoute allowedRoles={["Student", "Admin"]}>
              <Attendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/homework"
          element={
            <ProtectedRoute allowedRoles={["Student", "Admin"]}>
              <Homework />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/exams"
          element={
            <ProtectedRoute allowedRoles={["Student", "Admin"]}>
              <Exams />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/results"
          element={
            <ProtectedRoute allowedRoles={["Student", "Admin"]}>
              <Results />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/fees"
          element={
            <ProtectedRoute allowedRoles={["Student", "Admin"]}>
              <Fees />
            </ProtectedRoute>
          }
        />

        {/* 4. PARENT PORTAL (Parent & Admin access) */}
        <Route
          path="/parent"
          element={
            <ProtectedRoute allowedRoles={["Parent", "Admin"]}>
              <ParentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/attendance"
          element={
            <ProtectedRoute allowedRoles={["Parent", "Admin"]}>
              <ParentAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/homework"
          element={
            <ProtectedRoute allowedRoles={["Parent", "Admin"]}>
              <ParentHomework />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/exams"
          element={
            <ProtectedRoute allowedRoles={["Parent", "Admin"]}>
              <ParentExams />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/fees"
          element={
            <ProtectedRoute allowedRoles={["Parent", "Admin"]}>
              <ParentFees />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/meetings"
          element={
            <ProtectedRoute allowedRoles={["Parent", "Admin"]}>
              <ParentMeetings />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;