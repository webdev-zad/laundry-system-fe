import api from "./api";

interface LoginCredentials {
  email: string;
  password: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}

// Add cookie helper functions
const setCookie = (name: string, value: string, days: number) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
};

// const getCookie = (name: string) => {
//   const nameEQ = name + "=";
//   const ca = document.cookie.split(";");
//   for (let i = 0; i < ca.length; i++) {
//     let c = ca[i];
//     while (c.charAt(0) === " ") c = c.substring(1, c.length);
//     if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
//   }
//   return null;
// };

export const login = async (credentials: LoginCredentials): Promise<User> => {
  try {
    const response = await api.post("/users/login", credentials);
    // Try localStorage first, fall back to cookies
    try {
      localStorage.setItem("token", response.data.token);
    } catch (storageError) {
      console.error("Failed to store token in localStorage:", storageError);
      // Use cookies as fallback
      setCookie("token", response.data.token, 30); // Store for 30 days
    }
    return response.data;
  } catch (error) {
    console.error("Login API error:", error);
    throw error;
  }
};

export const logout = (): void => {
  localStorage.removeItem("token");
};

export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await api.get("/users/profile");
    return response.data;
  } catch (error) {
    console.error("Get current user API error:", error);
    throw error;
  }
};

export const updateProfile = async (userData: Partial<User>): Promise<User> => {
  const response = await api.put("/users/profile", userData);
  return response.data;
};
