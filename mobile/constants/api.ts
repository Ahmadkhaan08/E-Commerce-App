import { Platform } from "react-native";
import Constants from "expo-constants";

export const getBaseUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri;

  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:8000`;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:8000";
  }

  return "http://localhost:8000";
};