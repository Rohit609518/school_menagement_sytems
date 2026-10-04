import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/login";
import ProtectedRoute from "./routes/ProtectRouter";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDesbrod";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminTeachers from "./pages/admin/AdminTeachers";
import AdminParents from "./pages/admin/AdminParents";
import AdminFees from "./pages/admin/AdminFees";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentDetails from "./pages/student/StudentDetails";
import Attendance from "./pages/student/Attendance";
import Homework from "./pages/student/Homework";
import Exams from "./pages/student/Exams";
import Results from "./pages/student/Results";
import Fees from "./pages/student/Fees";

// Parent Pages
import ParentDashboard from "./pages/parent/ParentDashboard";
import ParentMeetings from "./pages/parent/ParentMeetings";

// Teacher Pages
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherStudents from "./pages/teacher/TeacherStudents";
import TeacherAttendance from "./pages/teacher/TeacherAttendance";
import TeacherResults from "./pages/teacher/TeacherResults";
import TeacherMeetings from "./pages/teacher/TeacherMeetings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication */}
        <Route path="/" element={<Login />} />

        {/* Admin Portal Routes */}
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

        {/* Student Portal Routes (Shared Family Access) */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["Student", "Parent", "Admin"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/details"
          element={
            <ProtectedRoute allowedRoles={["Student", "Parent", "Admin"]}>
              <StudentDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/attendance"
          element={
            <ProtectedRoute allowedRoles={["Student", "Parent", "Admin"]}>
              <Attendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/homework"
          element={
            <ProtectedRoute allowedRoles={["Student", "Parent", "Admin"]}>
              <Homework />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/exams"
          element={
            <ProtectedRoute allowedRoles={["Student", "Parent", "Admin"]}>
              <Exams />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/results"
          element={
            <ProtectedRoute allowedRoles={["Student", "Parent", "Admin"]}>
              <Results />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/fees"
          element={
            <ProtectedRoute allowedRoles={["Student", "Parent", "Admin"]}>
              <Fees />
            </ProtectedRoute>
          }
        />

        {/* Parent Portal Routes (Shared Family Access) */}
        <Route
          path="/parent"
          element={
            <ProtectedRoute allowedRoles={["Parent", "Student", "Admin"]}>
              <ParentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/meetings"
          element={
            <ProtectedRoute allowedRoles={["Parent", "Student", "Admin"]}>
              <ParentMeetings />
            </ProtectedRoute>
          }
        />

        {/* Teacher Portal Routes */}
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
          path="/teacher/results"
          element={
            <ProtectedRoute allowedRoles={["Teacher", "Admin"]}>
              <TeacherResults />
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

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;