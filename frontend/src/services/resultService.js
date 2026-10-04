import api from "./api";

// Student's own results
export const getMyResults = async (studentId) => {
  if (studentId) {
    const response = await api.get(`/result/student/${studentId}`);
    return response.data;
  }
  const response = await api.get("/result/my");
  return response.data;
};

// Parent's child results
export const getChildResults = async () => {
  const response = await api.get("/result/child");
  return response.data;
};

// Teacher / Admin: Get all results
export const getAllResults = async () => {
  const response = await api.get("/result");
  return response.data;
};

export const getResultsByStudent = async (studentId) => {
  const response = await api.get(`/result/student/${studentId}`);
  return response.data;
};

// Teacher / Admin: Create student result
export const createResult = async (data) => {
  const response = await api.post("/result", data);
  return response.data;
};

// Teacher / Admin: Update student result
export const updateResult = async (id, data) => {
  const response = await api.put(`/result/${id}`, data);
  return response.data;
};

// Delete student result
export const deleteResult = async (id) => {
  const response = await api.delete(`/result/${id}`);
  return response.data;
};

export const getMyResult = getMyResults;

export default {
  getMyResults,
  getChildResults,
  getAllResults,
  getResultsByStudent,
  createResult,
  updateResult,
  deleteResult
};