import axios from "axios";

const API = axios.create({
  baseURL: "https://learning-management-system-44su.onrender.com",
  withCredentials: true,
});

export default API;
