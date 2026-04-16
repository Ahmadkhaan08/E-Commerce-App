import Toast from "react-native-toast-message";

export const showSuccessToast = (text1: string, text2?: string) => {
  Toast.show({
    type: "success",
    text1,
    text2,
    position: "top",
    visibilityTime: 2200,
    topOffset: 56,
  });
};

export const showErrorToast = (text1: string, text2?: string) => {
  Toast.show({
    type: "error",
    text1,
    text2,
    position: "top",
    visibilityTime: 2600,
    topOffset: 56,
  });
};
