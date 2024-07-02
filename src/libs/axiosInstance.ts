import { isServer } from "@tanstack/react-query";
import axios from "axios";

function getBaseURL() {
  const vercelEnv = process.env.VERCEL_ENV;
  if (!isServer) {
    return "";
  }
  if (vercelEnv === "production") {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  } else if (vercelEnv === "preview") {
    return `https://${process.env.VERCEL_BRANCH_URL}`;
  }
  return "http://localhost:3000";
}

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
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
