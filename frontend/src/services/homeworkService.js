import api from "./api";

export const getMyHomework = async (studentId) => {
  const response = await api.get(`/homework/student/${studentId}`);
  return response.data;
};

export default getMyHomework;
