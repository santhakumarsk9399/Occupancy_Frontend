// import api from "../../Settings_Heatmap/utils/AxiosInstance";
import {
    getVid,
    getToken,getUsername
} from "../../Settings_Heatmap/components/Heatmaps/utils/sessionHelper";
import api from "../../Settings_heatmap/utils/AxiosInstance";

/* ============================
   COMMON
============================ */

const getHeaders = () => ({
    headers: {
        Authorization: `Bearer ${getToken()}`
    }
});

const buildPayload = (filters = {}) => ({
    vid: getVid(),
    inputDate: filters.inputDate || "",
    filters: filters.filters
});
const WidgetPayload = (filters = {}) => ({
    vid: getVid(),
    date: filters.inputDate || "",
    mallname: filters.mallname || "",
    floorname: filters.floorname || "",
    zonename: filters.zonename || "",
});

// const livePayLoad = (filters = {}) => ({
//     vid: getVid(),
//     date: filters.inputDate || "",
//     mallname: filters.mallname || "",
//     floorname: filters.floorname || "",
//     selectedZones: filters.zonename || "",
// });

/* ============================
   FILTER API
============================ */

export const getHeatmapFilter = async () => {
    try {
        const res = await api.post(
            "/heatmapConfig/getHeatmapFilter",
            {
                vid: getVid()
            },
            getHeaders()
        );
        return res.data;
    } catch (error) {
        console.error("Filter API Error:", error);
        throw error;
    }
};

export const getHeatmapFilter1 = async () => {

    try {
        const response = await api.post(
            `/heatmapConfig/getHeatmapFilter1`,
            {
                vid: getVid(),
                username: getUsername() 
            },
            getHeaders()
        );

        return response.data;
    } catch (error) {
        console.error("Filter API Error:", error);
        throw error;
    }
}
/* ============================
   Dashboard Data API
============================ */
export const getHeatmapLiveDashboard = async (filters) => {
    try {
        const res = await api.post(
            "/heatmapConfig/getHeatmapLiveDashboard",
            buildPayload(filters),
            getHeaders()
        );
        return res.data;
    }
    catch (error) {
        throw error;
    }
}

export const getHeatmapMallandZoneDashboard = async (filters) => {
    console.log(filters)
    try {
        const res = await api.post(
            "/heatmapConfig/getHeatmapDashboard1",
            buildPayload(filters),
            getHeaders()
        );
        return res.data;
    }
    catch (error) {
        throw error;
    }
}
export const getHeatmapMapwiseDashboard = async (filters) => {
    // console.log(filters)
    try {
        const res = await api.post(
            "/heatmapConfig/getHeatmapMapWiseDashboard",
            buildPayload(filters),
            getHeaders()
        );
        return res.data;
    }
    catch (error) {
        throw error;
    }
}
export const getLiveOccupancy = async (payload) => {
    try {
        const response = await api.post(
            `/heatmapConfig/liveOccupancy`,
            payload
        );

        return response.data;
    } catch (error) {
        console.error(
            "Live Occupancy API Error:",
            error
        );

        throw error;
    }
  };

/* ============================
   WIDGET 1
============================ */

export const getWidget1 = async (filters) => {
    try {
        const res = await api.post(
            "/heatmapConfig/liveOccupancyWidget1",
            WidgetPayload(filters),
            getHeaders()
        );
        return res.data;
    } catch (error) {
        console.error("Widget1 Error:", error);
        throw error;

    }
};

/* ============================
   WIDGET 2
============================ */

export const getWidget2 = async (filters) => {
    try {
        const res = await api.post(
            "/heatmapConfig/getDaysVisitorSummaryWidget2",
            WidgetPayload(filters),
            getHeaders()
        );
        return res.data;
    } catch (error) {
        console.error("Widget2 Error:", error);
        throw error;
    }
};

/* ============================
   WIDGET 3
============================ */

export const getWidget3 = async (filters) => {
    try {
        console.log(WidgetPayload(filters));
        const res = await api.post(
            "/heatmapConfig/getVisitorSummaryWidget3",
            WidgetPayload(filters),
            getHeaders()
        );
        return res.data;
    } catch (error) {
        console.error("Widget3 Error:", error);
        throw error;
    }
};

/* ============================
   WIDGET 4
============================ */

export const getWidget4 = async (filters) => {
    try {

        const res = await api.post(
            "/heatmapConfig/getPeakHoursWidget4",
            WidgetPayload(filters),
            getHeaders()
        );
        return res.data;
    } catch (error) {
        console.error("Widget4 Error:", error);
        throw error;
    }
};

/* ============================
   COMMON DASHBOARD API
============================ */

export const getDashboardWidgets = async (filters) => {
    try {
        const [widget1, widget2, widget3, widget4 ] = await Promise.all(
            [
                getWidget1(filters),
                getWidget2(filters),
                getWidget3(filters),
                getWidget4(filters)
            ]);
        return {
            widget1, widget2, widget3,widget4
        };
    } catch (error) {
        console.error("Dashboard Widgets Error:", error);
        throw error;
    }
};