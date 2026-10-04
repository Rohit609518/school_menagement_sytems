import api from "./api";

export const getMyParentProfile = async () => {
  const response = await api.get("/parents/my-profile");
  return response.data;
};

export const getChildren = async () => {
  const response = await api.get("/children");
  return response.data;
};

export const getParents = async () => {
  const response = await api.get("/parents");
  return response.data;
};

export const getParentById = async (id) => {
  const response = await api.get(`/parents/${id}`);
  return response.data;
};

export const createParent = async (data) => {
  const response = await api.post("/parents", data);
  return response.data;
};

export const updateParent = async (id, data) => {
  const response = await api.put(`/parents/${id}`, data);
  return response.data;
};

export const deleteParent = async (id) => {
  const response = await api.delete(`/parents/${id}`);
  return response.data;
};

export const assignStudentToParent = async (parentId, studentId) => {
  const response = await api.put(`/parents/${parentId}/assign-student`, { studentId });
  return response.data;
};

export default {
  getMyParentProfile,
  getChildren,
  getParents,
  getParentById,
  createParent,
  updateParent,
  deleteParent,
  assignStudentToParent
};
