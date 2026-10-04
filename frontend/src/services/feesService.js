import api from "./api";

// Student's own fees
export const getMyFees = async (studentId) => {
  if (studentId) {
    const response = await api.get(`/fees/student/${studentId}`);
    return response.data;
  }
  const response = await api.get("/fees/my");
  return response.data;
};

// Parent's child fees
export const getChildFees = async () => {
  const response = await api.get("/fees/child");
  return response.data;
};

// Admin / Teacher: View all fees
export const getAllFees = async () => {
  const response = await api.get("/fees");
  return response.data;
};

export const getFeesByStudent = async (studentId) => {
  const response = await api.get(`/fees/student/${studentId}`);
  return response.data;
};

// Admin only: Fees management
export const createFee = async (data) => {
  const response = await api.post("/fees", data);
  return response.data;
};

export const updateFee = async (id, data) => {
  const response = await api.put(`/fees/${id}`, data);
  return response.data;
};

export const deleteFee = async (id) => {
  const response = await api.delete(`/fees/${id}`);
  return response.data;
};

export const getMyFess = getMyFees;

export default {
  getMyFees,
  getChildFees,
  getAllFees,
  getFeesByStudent,
  createFee,
  updateFee,
  deleteFee
};