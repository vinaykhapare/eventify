import axios from "axios";

const rawBaseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const baseURL = rawBaseURL.replace(/\/+$/, "");

const API = axios.create({
  baseURL,
  withCredentials: true,
});

// Attach Authorization header from stored session
API.interceptors.request.use((config) => {
  try {
    const rawAuth = localStorage.getItem("auth");
    if (rawAuth) {
      const parsed = JSON.parse(rawAuth);
      if (parsed?.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    } else {
      // Fallback in case raw token was stored directly
      const rawToken = localStorage.getItem("token");
      if (rawToken) {
        config.headers.Authorization = `Bearer ${rawToken}`;
      }
    }
  } catch (err) {
    console.error("Error reading auth token in API interceptor:", err);
  }
  return config;
});

// Handle expired tokens or unauthenticated responses
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthRoute =
        window.location.pathname === "/login" ||
        window.location.pathname === "/signup";

      if (!isAuthRoute) {
        localStorage.removeItem("auth");
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default API;
