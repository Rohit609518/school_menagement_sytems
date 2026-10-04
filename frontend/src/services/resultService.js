import api from "./api";

// Student's own results
export const getMyResults = async (studentId) => {
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
export default getMyResults;