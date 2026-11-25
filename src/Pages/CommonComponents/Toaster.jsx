// // src/components/Common/Toaster.js
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const CONTAINER_ID = "global-toast";
// // helper functions
// export const showSuccess = (msg) => {
//   toast.success(msg, { position: "top-right" });
// };

// export const showError = (msg) => {
//   console.log("TOAST ERROR:", msg);
//   toast.error(msg, { position: "top-right" });
// };

// export const showInfo = (msg) => {
//   toast.info(msg, { position: "top-right" });
// };

// // toaster container (must render once in App.js)
// export const ToasterContainer = () => (
//   <ToastContainer
//     position="top-right"
//     autoClose={3000}
//     hideProgressBar={false}
//     newestOnTop
//     closeOnClick
//     draggable
//     pauseOnHover={false}
//     pauseOnFocusLoss={false}
//     theme="light"
//   style={{ zIndex: 99999 }}
//     toastStyle={{ textAlign: 'center' }}
//   />
// );
// src/components/Common/Toaster.js
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CONTAINER_ID = "global-toast";

export const showSuccess = (msg) =>
  toast.success(msg, { containerId: CONTAINER_ID, position: "top-right" });

export const showError = (msg) => {
  // console.log("TOAST ERROR:", msg);
  toast.error(msg, { containerId: CONTAINER_ID, position: "top-right" });
};

export const showInfo = (msg) =>
  toast.info(msg, { containerId: CONTAINER_ID, position: "top-right" });

export const ToasterContainer = () => (
  <ToastContainer
    containerId={CONTAINER_ID}
    position="top-right"
    autoClose={3000}
    hideProgressBar={false}
    newestOnTop
    closeOnClick
    draggable
    pauseOnHover={false}
    pauseOnFocusLoss={false}
    theme="light"
    style={{ zIndex: 99999 }}
    toastStyle={{ textAlign: "center" }}
  />
);