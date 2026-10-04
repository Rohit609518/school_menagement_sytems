import api from "./api";

// System Overview Stats
export const getSystemStats = async () => {
  const response = await api.get("/auth/stats");
  return response.data;
};

// User & Role Management APIs
export const getAllUsers = async () => {
  const response = await api.get("/auth/users");
  return response.data;
};

export const updateUserRole = async (userId, role) => {
  const response = await api.put(`/auth/users/${userId}/role`, { role });
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/auth/users/${userId}`);
  return response.data;
};

// Student Management APIs
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

// Teacher Management APIs
export const getTeachers = async () => {
  const response = await api.get("/teachers");
  return response.data;
};

export const getTeacherById = async (id) => {
  const response = await api.get(`/teachers/${id}`);
  return response.data;
};

export const createTeacher = async (data) => {
  const response = await api.post("/teachers", data);
  return response.data;
};

export const updateTeacher = async (id, data) => {
  const response = await api.put(`/teachers/${id}`, data);
  return response.data;
};

export const deleteTeacher = async (id) => {
  const response = await api.delete(`/teachers/${id}`);
  return response.data;
};

// Parent Management APIs
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