import api from "./api";

export const getMyStudentProfile = async () => {
  const response = await api.get("/students/my-profile");
  return response.data;
};