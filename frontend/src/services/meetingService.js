import api from "./api";

export const getMeetings = async () => {
  const response = await api.get("/meeting");
  return response.data;
};

export const getMeetingById = async (id) => {
  const response = await api.get(`/meeting/${id}`);
  return response.data;
};

export const createMeeting = async (data) => {
  const response = await api.post("/meeting", data);
  return response.data;
};

export const updateMeeting = async (id, data) => {
  const response = await api.put(`/meeting/${id}`, data);
  return response.data;
};

export const deleteMeeting = async (id) => {
  const response = await api.delete(`/meeting/${id}`);
  return response.data;
};
