import axios from "axios";


//  * Configuration utility for Admin API
interface adminApiConfig {
  baseUrl: String;
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
    baseUrl: `${apiUrl}/api`,
    isProduction,
  };
};



//  * Create configured axios instance
