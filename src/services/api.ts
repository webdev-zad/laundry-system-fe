import axios from "axios";

// Create an axios instance with default config
const api = axios.create({
  baseURL: "http://192.168.1.5:5000/api", // Halimbawa: "http://192.168.1.100:5000/api"
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    // Try to get token from localStorage first
    let token = localStorage.getItem("token");

    // If not in localStorage, try cookies
    if (!token) {
      const getCookie = (name: string) => {
        const nameEQ = name + "=";
        const ca = document.cookie.split(";");
        for (let i = 0; i < ca.length; i++) {
          let c = ca[i];
          while (c.charAt(0) === " ") c = c.substring(1, c.length);
          if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
      };

      token = getCookie("token");
    }

    console.log(`API Request to ${config.url}:`);
    console.log(`- Method: ${config.method?.toUpperCase()}`);
    console.log(`- Data:`, config.data);
    console.log(`- Token exists: ${!!token}`);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to log responses
api.interceptors.response.use(
  (response) => {
    console.log("API Response:", response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error("API Response Error:", error.config?.url, error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export default api;
