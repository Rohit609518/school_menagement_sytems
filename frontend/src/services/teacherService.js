import api from "./api";

export const getMyTeacherProfile = async () => {
  const response = await api.get("/teachers/my-profile");
  return response.data;
};

export const createHomework = async (data) => {
  const response = await api.post("/homework", data);
  return response.data;
};

export const createExam = async (data) => {
  const response = await api.post("/exams", data);
  return response.data;
};

export const markAttendance = async (data) => {
  const response = await api.post("/attendance", data);
  return response.data;
};
