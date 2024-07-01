import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    // Add any custom request interceptors here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => {
    // Add any custom response interceptors here
    return response;
  },
  (error) => {
    // Sentry.captureException(error);
    return Promise.reject(error);
  },
);

export default axiosInstance;
