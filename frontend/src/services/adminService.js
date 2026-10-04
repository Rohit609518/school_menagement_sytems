import api from "./api";

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