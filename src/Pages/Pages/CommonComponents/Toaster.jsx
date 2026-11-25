// src/components/Common/Toaster.js
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// helper functions
export const showSuccess = (msg) => {
  toast.success(msg, { position: "top-right" });
};

export const showError = (msg) => {
  toast.error(msg, { position: "top-right" });
};

export const showInfo = (msg) => {
  toast.info(msg, { position: "top-right" });
};

// toaster container (must render once in App.js)
export const ToasterContainer = () => {
  return <ToastContainer autoClose={2000} hideProgressBar={false} />;
};
