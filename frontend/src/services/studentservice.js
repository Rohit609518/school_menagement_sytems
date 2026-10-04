import api from "./api";

export const getMyStudentProfile = async () => {
  const response = await api.get("/students/my-profile");
  return response.data;
};

export const getStudents = async () => {
  const response = await api.get("/students");
  return response.data;
};

export const getStudentById = async (id) => {
  const response = await api.get(`/students/${id}`);
  return response.data;
};

export const createStudent = async (data) => {
  const response = await api.post("/students", data);
  return response.data;
};

export const updateStudent = async (id, data) => {
  const response = await api.put(`/students/${id}`, data);
  return response.data;
};

export const deleteStudent = async (id) => {
  const response = await api.delete(`/students/${id}`);
  return response.data;
};

export default {
  getMyStudentProfile,
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
};