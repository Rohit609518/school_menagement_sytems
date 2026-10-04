import api from "./api";

// Student's own attendance
export const getMyAttendance = async (studentId) => {
  const response = await api.get(`/attendance/student/${studentId}`);
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

export default getMyAttendance;