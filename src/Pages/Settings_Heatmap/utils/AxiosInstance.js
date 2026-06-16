// import axios from "axios";

// // const BASE = import.meta.env.VITE_BACKEND_URL;
// const BASE = import.meta.env.VITE_API_URL;
// console.log("BASE URL:", BASE); // debug

// const api = axios.create({
//     baseURL: BASE,
//     headers: {
//         "Content-Type": "application/json",
//     },
// });

// export default api;
import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem("token");

    console.log("TOKEN:", token);

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;