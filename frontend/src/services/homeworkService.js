import api from "./api";

// Student's own homework
export const getMyHomework = async (studentId) => {
  if (studentId) {
    const response = await api.get(`/homework/student/${studentId}`);
    return response.data;
  }
  const response = await api.get("/homework/my");
  return response.data;
};

// Parent's child homework
export const getChildHomework = async () => {
  const response = await api.get("/homework/child");
  return response.data;
};

// Teacher / Admin: Get all homework
export const getAllHomework = async () => {
  const response = await api.get("/homework");
  return response.data;
};

export const getHomeworkByStudent = async (studentId) => {
  const response = await api.get(`/homework/student/${studentId}`);
  return response.data;
};

// Teacher / Admin: Create homework
export const createHomework = async (data) => {
  const response = await api.post("/homework", data);
  return response.data;
};

// Teacher / Admin: Update homework
export const updateHomework = async (id, data) => {
  const response = await api.put(`/homework/${id}`, data);
  return response.data;
};

// Teacher / Admin: Delete homework
export const deleteHomework = async (id) => {
  const response = await api.delete(`/homework/${id}`);
  return response.data;
};

export default {
  getMyHomework,
  getChildHomework,
  getAllHomework,
  getHomeworkByStudent,
  createHomework,
  updateHomework,
  deleteHomework
};
