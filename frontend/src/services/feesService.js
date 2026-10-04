import api from "./api";

// Student's own fees
export const getMyFees = async (studentId) => {
  const response = await api.get(`/fees/student/${studentId}`);
  return response.data;
};

// Admin / All fees
export const getAllFees = async () => {
  const response = await api.get("/fees");
  return response.data;
};

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
export default getMyFees;