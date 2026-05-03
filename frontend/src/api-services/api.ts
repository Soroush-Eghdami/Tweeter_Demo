import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.BASE_API_URL,
  withCredentials: true,
  timeout: 3000,
});

export default api;
