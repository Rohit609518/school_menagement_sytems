import api from "./api";

export const getMyExams = async (studentId) => {
  const response = await api.get(`/exams/student/${studentId}`);
  return response.data;
};

export default getMyExams;