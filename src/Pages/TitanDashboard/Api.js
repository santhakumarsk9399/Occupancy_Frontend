import api from "../Settings_heatmap/utils/AxiosInstance";
import {
    getVid,
    getToken,getUsername
} from "../Settings_Heatmap/components/Heatmaps/utils/sessionHelper";

/* ============================
   COMMON
============================ */
const getHeaders = () => ({
    headers: {
        Authorization: `Bearer ${getToken()}`
    }
});

export const getTitanDashData = async () => {
    try {
        const res = await api.get(
            "/dashboard/getTtianCustomDashboardData",
                     {
                        //   vid: getVid(),
                          username: getUsername() 
                      },
                      getHeaders()
        );

        console.log(
            "Titan Dashboard API Response:",
            res.data
        );

        return res.data;

    } catch (error) {
        console.error(
            "Titan Dashboard API Error:",
            error?.response?.data || error
        );

        throw error;
    }
};