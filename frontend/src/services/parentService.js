import api from "./api";

export const getMyParentProfile = async () => {
  const response = await api.get("/parents/my-profile");
  return response.data;
};
