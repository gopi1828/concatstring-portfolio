import axios from "axios";
import { toast } from "react-hot-toast";

const baseURL =
  // (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(
  //   /\/$/,
  //   ""
  // ) ||
   "http://localhost:5000";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Add request interceptor to include token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");

      const errorMessage =
        error.response?.data?.message || "Session expired. Please login again.";
      toast.error(errorMessage);

      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    }
    return Promise.reject(error);
  }
);

export default api;
