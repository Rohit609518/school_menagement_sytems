import api from "./api";

// Student's own exams
export const getMyExams = async (studentId) => {
  if (studentId) {
    const response = await api.get(`/exams/student/${studentId}`);
    return response.data;
  }
  const response = await api.get("/exams/my");
  return response.data;
};

// Parent's child exams
export const getChildExams = async () => {
  const response = await api.get("/exams/child");
  return response.data;
};

// Teacher / Admin: Get all exams
export const getAllExams = async () => {
  const response = await api.get("/exams");
  return response.data;
};

export const getExamsByStudent = async (studentId) => {
  const response = await api.get(`/exams/student/${studentId}`);
  return response.data;
};

export const createExam = async (data) => {
  const response = await api.post("/exams", data);
  return response.data;
};

export const updateExam = async (id, data) => {
  const response = await api.put(`/exams/${id}`, data);
  return response.data;
};

export const deleteExam = async (id) => {
  const response = await api.delete(`/exams/${id}`);
  return response.data;
};

export default {
  getMyExams,
  getChildExams,
  getAllExams,
  getExamsByStudent,
  createExam,
  updateExam,
  deleteExam
};