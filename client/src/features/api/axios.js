import axios from "axios";

const api = axios.create({
  baseURL: "https://learning-management-system-44su.onrender.com/api/v1",
  withCredentials: true,
});

export default api;
