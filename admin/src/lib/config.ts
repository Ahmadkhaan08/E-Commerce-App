import axios, { type AxiosInstance, type AxiosResponse } from "axios";

//  * Configuration utility for Admin API
interface adminApiConfig {
  baseURL: string;
  isProduction: Boolean;
}

//  * Get API configuration for admin
export const getAdminApiConfig = (): adminApiConfig => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) {
    throw new Error("VITE_API_URL environment variable is not defined");
  }

  const isProduction =
    import.meta.env.VITE_APP_ENV === "production" ||
    import.meta.env.PROD === true;

  return {
    baseURL: `${apiUrl}/api`,
    isProduction,
  };
};

//  * Create configured axios instance
export const createApiInsatnce = (): AxiosInstance => {
  const { baseURL } = getAdminApiConfig();
  const instance = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
    timeout: 30000, // 30 seconds timeout
  });

  // Add request interceptor to include auth token
  instance.interceptors.request.use(
    (config) => {
      // Get token from localStorage (zustand persist stores it there)
      const authData = localStorage.getItem("auth-storage");
      if (authData) {
        try {
          const parsedData = JSON.parse(authData);
          const token = parsedData.state?.token;
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error("Error parsing auth data:", error);
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  // Add response interceptor for better error handling
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error) => {
      if (error.code === "ERR_NETWORK") {
        console.error(
          "Network Error: Unable to connect to the server. Please check if the server is running.",
        );
      }

      // Handle 401 unauthorized errors
      if (error.response?.status === 401) {
        localStorage.removeItem("auth-storage");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    },
  );
  return instance;
};

// Create and export the configured axios instance
export const adminApi = createApiInsatnce();

//  * Admin API endpoints
export const ADMIN_API_ENDPOINT = {
  // auth
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  lOGOUT: "/auth/logout",
} as const;

//  * Helper function to build query parameters
export const buildAdminQueryParams = (
  params: Record<string, string | number | Boolean | undefined>,
): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};

export default adminApi
