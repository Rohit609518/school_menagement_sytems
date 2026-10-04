import api from "./api";

// Student's own attendance
export const getMyAttendance = async (studentId) => {
  if (studentId) {
    const response = await api.get(`/attendance/student/${studentId}`);
    return response.data;
  }
  const response = await api.get("/attendance/my");
  return response.data;
};

// Parent's child attendance
export const getChildAttendance = async () => {
  const response = await api.get("/attendance/child");
  return response.data;
};

// Teacher / Admin: Mark attendance
export const markStudentAttendance = async (data) => {
  const response = await api.post("/attendance", data);
  return response.data;
};

// Teacher / Admin: Get all attendance records
export const getAllAttendance = async () => {
  const response = await api.get("/attendance");
  return response.data;
};

// Get specific student's attendance
export const getAttendanceByStudent = async (studentId) => {
  const response = await api.get(`/attendance/student/${studentId}`);
  return response.data;
};

// Update attendance record
export const updateAttendance = async (id, data) => {
  const response = await api.put(`/attendance/${id}`, data);
  return response.data;
};

// Delete attendance record
export const deleteAttendance = async (id) => {
  const response = await api.delete(`/attendance/${id}`);
  return response.data;
};

export default {
  getMyAttendance,
  getChildAttendance,
  markStudentAttendance,
  getAllAttendance,
  getAttendanceByStudent,
  updateAttendance,
  deleteAttendance
};