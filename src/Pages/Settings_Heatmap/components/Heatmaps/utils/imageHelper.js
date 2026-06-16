// utils/imageHelper.js

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const getImageUrl = (url) => {
    if (!url) return "";

    if (url.startsWith("http")) {
        return url;
    }

    return `${API_BASE_URL}${url}`;
};